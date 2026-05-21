import { generateSign } from "@/utils/crypto";

let baseUrl: string;
console.log("process.env.NODE_ENV:", process.env.NODE_ENV);
switch (process.env.NODE_ENV) {
	case "development":
		baseUrl = "http://localhost:9999";
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
const timeout = 10000;

type RequestOptions = {
	url: string;
	method?: "GET" | "POST" | "PUT" | "DELETE";
	data?: any;
	header?: any;
	loading?: boolean;
};

let isRefreshing = false;
let refreshSubscribers: Array<(token: string) => void> = [];

const onRefreshed = (newToken: string) => {
	refreshSubscribers.forEach((callback) => callback(newToken));
	refreshSubscribers = [];
};

const addRefreshSubscriber = (callback: (token: string) => void) => {
	refreshSubscribers.push(callback);
};

const request = <T>(options: RequestOptions): Promise<T> => {
	const { url, method = "GET", data = {}, header = {} } = options;

	let loading = true;

	if (loading) {
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
								uni.showToast({
									title: responseData.message || "业务逻辑错误",
									icon: "none",
								});
								reject(responseData as T);
							}
							break;

						case 401:
							handle401(url, method, data, header, options, resolve, reject, res);
							break;

						case 404:
							uni.showToast({ title: "资源不存在 (404)", icon: "none" });
							reject(res as T);
							break;

						case 500:
							uni.showToast({ title: "服务器开小差了 (500)", icon: "none" });
							reject(res as T);
							break;

						default:
							uni.showToast({
								title: `系统错误：${statusCode}`,
								icon: "none",
							});
							reject(res as T);
							break;
					}
				},
				fail: (err) => {
					let errMsg = "网络异常，请检查网络";
					if (err.errMsg.includes("timeout")) {
						errMsg = "请求超时，请稍后重试";
					}
					uni.showToast({
						title: errMsg,
						icon: "none",
					});
					reject(err);
				},
				complete: () => {
					if (loading) {
						uni.hideLoading();
					}
				},
			});
		};

		doRequest();
	});
};

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
		uni.showToast({
			title: "登录过期，请重新登录",
			icon: "none",
		});
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
			uni.showToast({
				title: "登录过期，请重新登录",
				icon: "none",
			});
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

				if (refreshRes.statusCode === 200 && refreshData.code === 200 && refreshData.data.accessToken) {
					uni.setStorageSync("accessToken", refreshData.data.accessToken);
					console.log("Access Token 静默刷新成功");
					onRefreshed(refreshData.data.accessToken);
					retryRequest(url, method, data, header, options, resolve, reject);
				} else {
					uni.removeStorageSync("accessToken");
					uni.removeStorageSync("refreshToken");
					uni.showToast({
						title: "登录过期，请重新登录",
						icon: "none",
					});
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
				uni.showToast({
					title: "登录过期，请重新登录",
					icon: "none",
				});
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
				uni.showToast({
					title: responseData.message || "请求失败",
					icon: "none",
				});
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
