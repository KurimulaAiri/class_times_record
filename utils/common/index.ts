import { post } from "../../utils/request";

export const jump = (path: string, data: any) => {
	// 关键点：使用 encodeURIComponent 包装 JSON 字符串
	const dataStr = encodeURIComponent(JSON.stringify(data));

	uni.navigateTo({
		url: `${path}?data=${dataStr}`,
	});
};

export const login = () => {
	uni.login({
		provider: "weixin",
		success: (res) => {
			if (res.code) {
				// 将 code 发送到你的后端服务器
				post<LoginResponse>("/auth/login", {
					code: res.code,
				}).then((res) => {
					console.log("登录响应:", res);
					// 缓存 token
					// res 现在就是你后端 data 里的内容
					uni.setStorageSync("token", res.data.token);
					console.log("Token 已缓存");
				});
			}
		},
	});
};
