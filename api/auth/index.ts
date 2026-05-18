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

/**
 * 退出登录
 * @param targetRoute 退出后要跳转的目标页面（可选，默认去首页）
 * @param params 跳转时携带的参数（可选）
 */
const logOut = (targetRoute: string = ROUTES.INDEX, params: any = null) => {
	const userStore = useUserStore();
	userStore.clearUserInfo();

	const token = uni.getStorageSync("token");

	// 2. 发送异步登出请求给后端（不需要在 then 里面处理跳转，避免阻塞）
	post("/auth/logout", { token })
		.then((res) => {
			console.log("后端同步登出成功:", res);
		})
		.catch((err) => {
			console.error("后端登出接口异常:", err);
		});

	// 1. 同步清除本地缓存和状态（防止用户返回上一页查看到残存数据）
	uni.removeStorageSync("token");
	uni.removeStorageSync("openId");

	// 3. 💡 修复点 2：显示 Toast 提示，并在延迟后执行唯一的、正确的跳转
	uni.showToast({
		title: "正在退出...",
		icon: "loading",
		duration: 800,
		mask: true,
	});

	setTimeout(() => {
		// 如果是去登录页，用普通的 jump；如果是直接退出，用 relaunch 彻底清空栈
		const jumpType = targetRoute === ROUTES.INDEX ? "relaunch" : "navigate";

		// 执行最终的路由跳转
		jump(targetRoute, params, jumpType);
	}, 800);
};

export { loginNoPwd, loginByPwd, getOpenId, loginByToken, logOut };
