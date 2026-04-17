// 基础域名（根据环境切换，如开发/生产环境）
let baseUrl: string;
console.log("process.env.NODE_ENV:", process.env.NODE_ENV);
switch (process.env.NODE_ENV) {
	case "development":
		// baseUrl = "https://api.kurimula-airi.top"; // 生产环境
		baseUrl = "http://localhost:9999"; // 开发环境
		break;
	case "production":
		baseUrl = "https://api.kurimula-airi.top"; // 生产环境
		break;
	case "trial":
		baseUrl = "https://api.kurimula-airi.top"; // 试用环境
		break;
	default:
		baseUrl = "https://api.kurimula-airi.top"; // 默认生产环境
		break;
}
// 请求超时时间（毫秒）
const timeout = 10000;

/**
 * 基础请求函数
 * @param {Object} options - 请求配置
 * @param {string} options.url - 接口路径（无需写基础域名）
 * @param {string} options.method - 请求方法（GET/POST/PUT/DELETE）
 * @param {Object} [options.data] - 请求参数（GET拼在url，POST在body）
 * @param {Object} [options.header] - 自定义请求头（会合并默认头）
 * @param {boolean} [options.loading=true] - 是否显示加载中提示
 * @returns {Promise} 返回请求结果
 */

type RequestOptions = {
	url: string;
	method?: "GET" | "POST" | "PUT" | "DELETE";
	data?: any;
	header?: any;
	loading?: boolean;
};


const request = <T>(options: RequestOptions): Promise<T> => {
	// 解构参数，设置默认值
	const {
		url,
		method = "GET",
		data = {},
		header = {},
		loading = true,
	} = options;

	// 显示加载中（可自定义样式）
	if (loading) {
		uni.showLoading({
			title: "加载中...",
			mask: true, // 防止点击穿透
		});
	}

	// 拼接完整接口地址
	// 2. 检查 url 字符串逻辑
	// 确保 url 是以 / 开头的，防止拼接出 localhost:9999course_record/get
	const safeUrl = url.startsWith("/") ? url : "/" + url;
	const fullUrl = baseUrl + safeUrl;

	console.log("请求URL:", fullUrl);

	// 返回Promise，统一处理请求
	return new Promise((resolve, reject) => {
		uni.request({
			url: fullUrl,
			method,
			data,
			header: {
				// 默认请求头（可根据后端要求调整，如JSON格式、token）
				"Content-Type": "application/json",
				token: uni.getStorageSync("token") || "", // 从本地缓存取token
				...header, // 合并自定义请求头（优先级更高）
			},
			timeout,
			// 请求成功回调
			success: (res) => {
				// console.log("请求成功:", res);
				// 1. 自动检测响应头是否有新 Token
				// 注意：微信小程序中 header 的 key 通常是小写
				const newToken = res.header["new-token"] || res.header["New-Token"];
				if (newToken) {
					uni.setStorageSync("token", newToken);
					console.log("Token 已自动延期");
				}

				const statusCode = res.statusCode;
				const  data = res.data as ApiResponse<any>;

				switch (statusCode) {
					case 200:
						// HTTP 请求成功，开始判断业务逻辑状态码
						if (data.code === 200) {
							resolve(data as T); // 业务逻辑成功
						} else {
							// 业务逻辑错误（如：参数非法、权限不足但非登录失效）
							uni.showToast({
								title: data.message || "业务逻辑错误",
								icon: "none",
							});
							reject(data as T);
						}
						break;

					case 401:
						// Token 过期或无效
						uni.removeStorageSync("token");
						uni.showToast({
							title: "重新登录",
							icon: "none",
						});
						// 延迟跳转
						setTimeout(() => {
							uni.reLaunch({ url: "/pages/index/index" });
						}, 1500);
						reject(res as T);
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
						// 其他 HTTP 错误
						uni.showToast({
							title: `系统错误：${statusCode}`,
							icon: "none",
						});
						reject(res as T);
						break;
				}
			},
			// 请求失败回调（网络错误、超时等）
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
			// 无论成功失败，最终执行（隐藏加载中）
			complete: () => {
				if (!loading) {
					uni.hideLoading();
				}
			},
		});
	});
};

// 封装GET请求
export const get = <T>(url: string, data = {}, options = {}): Promise<ApiResponse<T>> => {
	return request<ApiResponse<T>>({
		url,
		method: "GET",
		data,
		...options,
	});
};

// 封装POST请求
export const post = <T>(url: string, data = {}, options = {}): Promise<ApiResponse<T>> => {
	return request<ApiResponse<T>>({
		url,
		method: "POST",
		data,
		...options,
	});
};

// 封装PUT请求（按需扩展）
export const put = <T>(url: string, data = {}, options = {}): Promise<ApiResponse<T>> => {
	return request<ApiResponse<T>>({
		url,
		method: "PUT",
		data,
		...options,
	});
};

// 封装DELETE请求（按需扩展）
export const del = <T>(url: string, data = {}, options = {}): Promise<ApiResponse<T>> => {
	return request<ApiResponse<T>>({
		url,
		method: "DELETE",
		data,
		...options,
	});
};

// 暴露默认请求方法（如需自定义method时使用）
export default request;
