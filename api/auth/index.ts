import { post } from "@/utils/request";
import { useUserStore } from "@/stores/user";
import { ROUTES } from "@/config/routes";
import { jump } from "@/utils/common";

const getOpenId = (): Promise<ApiResponse<LoginResponse>> => {
	console.log("获取 OpenID");
	return new Promise((resolve, reject) => {
		uni.login({
			provider: "weixin",
			success: async (res) => {
				if (res.code) {
					try {
						// 这里的 post 必须被 resolve 出去
						const response = await post<LoginResponse>("/auth/get_open_id", {
							code: res.code,
						});
						console.log("OpenID 获取成功:", response);
						// 缓存 OpenID
						uni.setStorageSync("openId", response.data.openId);
						resolve(response);
					} catch (err) {
						reject(err);
					}
				} else {
					reject(res);
				}
			},
			fail: (err) => reject(err),
		});
	});
};

const loginByPwd = async (
	data: LoginRequest,
): Promise<ApiResponse<LoginResponse>> => {
	try {
		// 1. 等待获取 OpenID
		const res = await getOpenId();
		const openId = res.data.openId;

		console.log("OpenID 获取成功:", openId);

		// 2. 发起最终登录请求并返回结果
		return await post<LoginResponse>("/auth/login_by_pwd", {
			...data,
			openId,
		});
	} catch (error) {
		console.error("登录链路失败:", error);
		return Promise.reject(error);
	}
};

const loginNoPwd = () => {
	const userInfo = useUserStore().userInfo;
	if (userInfo !== null && userInfo !== undefined) {
		uni.login({
			provider: "weixin",
			success: (res) => {
				if (res.code) {
					// 将 code 发送到你的后端服务器
					post<LoginResponse>("/auth/login_no_pwd", {
						code: res.code,
						role: userInfo.roleId,
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
	}
};

const loginByToken = async (
	token: string,
): Promise<ApiResponse<LoginResponse>> => {
	try {
		// 1. 等待获取 OpenID
		const res = await getOpenId();
		const openId = res.data.openId;

		console.log("OpenID 获取成功:", openId);

		// 2. 发起最终登录请求并返回结果
		return await post<LoginResponse>("/auth/login_by_token", {
			token,
			openId,
		});
	} catch (error) {
		console.error("登录链路失败:", error);
		return Promise.reject(error);
	}
};

const logOut = () => {
	const token = uni.getStorageSync("token");
	post("/auth/logout", {
		token,
	}).then((res) => {
		if (res.code === 200) {
			uni.showToast({
				title: "退出登录成功",
				icon: "success",
			});
		}
		console.log("退出登录成功:", res);
		uni.hideToast();
	});
	uni.removeStorageSync("token");
	uni.removeStorageSync("openId");
	// 清除用户信息
	const userStore = useUserStore();
	userStore.clearUserInfo();
	// 跳转到登录页
	jump(ROUTES.INDEX, null, "relaunch");
};

export { loginNoPwd, loginByPwd, getOpenId, loginByToken, logOut };
