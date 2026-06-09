/** @description HTTP 请求封装，基于 uni.request 实现统一请求拦截、Token 自动刷新、401 重试等机制 */
import { generateSign } from "@/utils/crypto";
import { showToast } from "@/utils/common";

/** API 基础地址，根据环境变量自动切换 */
let baseUrl: string;
console.log("process.env.NODE_ENV:", process.env.NODE_ENV);
switch (process.env.NODE_ENV) {
	case "development":
		baseUrl = "http://localhost:9999";
		// baseUrl = "https://api.kurimula-airi.top";

		break;
	case "production":
		baseUrl = "https://api.kurimula-airi.top";
		break;
	case "trial":
		baseUrl = "https://api.kurimula-airi.top";
		break;
	default:
		baseUrl = "https://api.kurimula-airi.top";
		break;
}
/** 请求超时时间（毫秒） */
const timeout = 10000;

/** 请求配置选项 */
type RequestOptions = {
	/** 请求路径 */
	url: string;
	/** 请求方法，默认 GET */
	method?: "GET" | "POST" | "PUT" | "DELETE";
	/** 请求体数据 */
	data?: any;
	/** 自定义请求头 */
	header?: any;
	/** 是否显示加载提示，默认 true */
	loading?: boolean;
};

/** Token 是否正在刷新中，防止并发刷新 */
let isRefreshing = false;
/** Token 刷新完成后的回调队列，刷新成功后依次执行 */
let refreshSubscribers: Array<(token: string) => void> = [];

/**
 * Token 刷新成功后，通知所有等待中的请求使用新 Token 重试
 * @param newToken 刷新后的新 accessToken
 */
const onRefreshed = (newToken: string) => {
	refreshSubscribers.forEach((callback) => callback(newToken));
	refreshSubscribers = [];
};

/**
 * 将等待 Token 刷新的请求回调加入队列
 * @param callback 刷新成功后要执行的回调，接收新 Token 作为参数
 */
const addRefreshSubscriber = (callback: (token: string) => void) => {
	refreshSubscribers.push(callback);
};

/**
 * 核心请求函数，封装 uni.request，自动添加签名头和 Token，处理响应状态码
 * @param options 请求配置选项
 * @returns Promise<T> 响应数据
 */
const request = <T>(options: RequestOptions): Promise<T> => {
	const { url, method = "GET", data = {}, header = {} } = options;

	let loading = true;

	if (loading) {
		console.log("loading:", url);
		uni.showLoading({
			title: "加载中...",
			mask: true,
		});
	}

	const { sign, timestamp, nonce } = generateSign(data);

	const safeUrl = url.startsWith("/") ? url : "/" + url;
	const fullUrl = baseUrl + safeUrl;

	console.log("请求URL:", fullUrl);

	return new Promise((resolve, reject) => {
		const doRequest = () => {
			const accessToken = uni.getStorageSync("accessToken") || "";

			uni.request({
				url: fullUrl,
				method,
				data,
				header: {
					"Content-Type": "application/json",
					token: accessToken,
					...header,
					"x-sign": sign,
					"x-timestamp": timestamp,
					"x-nonce": nonce,
				},
				timeout,
				success: (res) => {
					const statusCode = res.statusCode;
					const responseData = res.data as ApiResponse<any>;

					switch (statusCode) {
						case 200:
							if (responseData.code === 200) {
								resolve(responseData as T);
							} else {
								showToast({ msg: responseData.message || "业务逻辑错误", icon: "none" });
								reject(responseData as T);
							}
							break;

						case 401:
							handle401(
								url,
								method,
								data,
								header,
								options,
								resolve,
								reject,
								res,
							);
							break;
						case 404:
							showToast({ msg: "资源不存在 (404)", icon: "none" });
							reject(res as T);
							break;
						case 500:
							showToast({ msg: "服务器开小差了 (500)", icon: "none" });
							reject(res as T);
							break;
						default:
							showToast({ msg: `${responseData.message || "未知错误"}`, icon: "none" });
							reject(res as T);
							break;
					}
				},
				fail: (err) => {
					let errMsg = "网络异常，请检查网络";
					if (err.errMsg.includes("timeout")) {
						errMsg = "请求超时，请稍后重试";
					}
					showToast({ msg: errMsg, icon: "none" });

					reject(err);
				},
				complete: () => {
					if (loading) {
						console.log("hideLoading:", url);
						uni.hideLoading();
					}
				},
			});
		};

		doRequest();
	});
};

/**
 * 处理 401 未授权响应，自动尝试使用 refreshToken 刷新 Token 并重试请求
 * @param url 原始请求路径
 * @param method 原始请求方法
 * @param data 原始请求数据
 * @param header 原始请求头
 * @param options 原始请求配置
 * @param resolve Promise resolve 函数
 * @param reject Promise reject 函数
 * @param _res 原始响应对象
 */
const handle401 = (
	url: string,
	method: string,
	data: any,
	header: any,
	options: RequestOptions,
	resolve: Function,
	reject: Function,
	_res: any,
) => {
	if (url === "/auth/refresh") {
		uni.removeStorageSync("accessToken");
		uni.removeStorageSync("refreshToken");
		showToast({ msg: "登录过期，请重新登录", icon: "none" });
		setTimeout(() => {
			uni.reLaunch({ url: "/pages/index/index" });
		}, 1500);
		reject(_res);
		return;
	}

	if (!isRefreshing) {
		isRefreshing = true;

		const refreshToken = uni.getStorageSync("refreshToken") || "";

		if (!refreshToken) {
			isRefreshing = false;
			uni.removeStorageSync("accessToken");
			showToast({ msg: "登录过期，请重新登录", icon: "none" });
			setTimeout(() => {
				uni.reLaunch({ url: "/pages/index/index" });
			}, 1500);
			reject(_res);
			return;
		}

		uni.request({
			url: baseUrl + "/auth/refresh",
			method: "POST",
			data: { token: refreshToken },
			header: { "Content-Type": "application/json" },
			timeout,
			success: (refreshRes) => {
				isRefreshing = false;
				const refreshData = refreshRes.data as ApiResponse<LoginResponse>;

				if (
					refreshRes.statusCode === 200 &&
					refreshData.code === 200 &&
					refreshData.data.accessToken
				) {
					uni.setStorageSync("accessToken", refreshData.data.accessToken);
					console.log("Access Token 静默刷新成功");
					onRefreshed(refreshData.data.accessToken);
					retryRequest(url, method, data, header, options, resolve, reject);
				} else {
					uni.removeStorageSync("accessToken");
					uni.removeStorageSync("refreshToken");
					showToast({ msg: "登录过期，请重新登录", icon: "none" });
					setTimeout(() => {
						uni.reLaunch({ url: "/pages/index/index" });
					}, 1500);
					reject(refreshRes);
				}
			},
			fail: () => {
				isRefreshing = false;
				uni.removeStorageSync("accessToken");
				uni.removeStorageSync("refreshToken");
				showToast({ msg: "登录过期，请重新登录", icon: "none" });
				setTimeout(() => {
					uni.reLaunch({ url: "/pages/index/index" });
				}, 1500);
				reject(_res);
			},
		});

		addRefreshSubscriber(() => {
			retryRequest(url, method, data, header, options, resolve, reject);
		});
	} else {
		addRefreshSubscriber(() => {
			retryRequest(url, method, data, header, options, resolve, reject);
		});
	}
};

/**
 * 使用新 Token 重试之前失败的请求
 * @param url 请求路径
 * @param method 请求方法
 * @param data 请求数据
 * @param header 请求头
 * @param options 原始请求配置
 * @param resolve Promise resolve 函数
 * @param reject Promise reject 函数
 */
const retryRequest = (
	url: string,
	method: string,
	data: any,
	header: any,
	options: RequestOptions,
	resolve: Function,
	reject: Function,
) => {
	const { sign, timestamp, nonce } = generateSign(data);
	const accessToken = uni.getStorageSync("accessToken") || "";

	const fullUrl = baseUrl + (url.startsWith("/") ? url : "/" + url);

	uni.request({
		url: fullUrl,
		method: method as any,
		data,
		header: {
			"Content-Type": "application/json",
			token: accessToken,
			...header,
			"x-sign": sign,
			"x-timestamp": timestamp,
			"x-nonce": nonce,
		},
		timeout,
		success: (res) => {
			const responseData = res.data as ApiResponse<any>;
			if (res.statusCode === 200 && responseData.code === 200) {
				resolve(responseData);
			} else {
				showToast({ msg: responseData.message || "请求失败", icon: "none" });

				reject(responseData);
			}
		},
		fail: (err) => {
			reject(err);
		},
		complete: () => {
			if (options.loading !== false) {
				uni.hideLoading();
			}
		},
	});
};

/**
 * 发送 GET 请求
 * @param url 请求路径
 * @param data 查询参数，默认 {}
 * @param options 额外请求配置，默认 {}
 */
export const get = <T>(
	url: string,
	data = {},
	options = {},
): Promise<ApiResponse<T>> => {
	return request<ApiResponse<T>>({
		url,
		method: "GET",
		data,
		...options,
	});
};

/**
 * 发送 POST 请求
 * @param url 请求路径
 * @param data 请求体数据，默认 {}
 * @param options 额外请求配置，默认 {}
 */
export const post = <T>(
	url: string,
	data = {},
	options = {},
): Promise<ApiResponse<T>> => {
	return request<ApiResponse<T>>({
		url,
		method: "POST",
		data,
		...options,
	});
};

/**
 * 发送 PUT 请求
 * @param url 请求路径
 * @param data 请求体数据，默认 {}
 * @param options 额外请求配置，默认 {}
 */
export const put = <T>(
	url: string,
	data = {},
	options = {},
): Promise<ApiResponse<T>> => {
	return request<ApiResponse<T>>({
		url,
		method: "PUT",
		data,
		...options,
	});
};

/**
 * 发送 DELETE 请求
 * @param url 请求路径
 * @param data 请求体数据，默认 {}
 * @param options 额外请求配置，默认 {}
 */
export const del = <T>(
	url: string,
	data = {},
	options = {},
): Promise<ApiResponse<T>> => {
	return request<ApiResponse<T>>({
		url,
		method: "DELETE",
		data,
		...options,
	});
};

export default request;
