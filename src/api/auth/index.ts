import { post } from "@/utils/request";
import { useUserStore } from "@/stores/user";
import { ROUTES } from "@/config/routes";
import { jump } from "@/utils/common";

const storeTokens = (res: ApiResponse<LoginResponse>) => {
	if (res.data.accessToken) {
		uni.setStorageSync("accessToken", res.data.accessToken);
	}
	if (res.data.refreshToken) {
		uni.setStorageSync("refreshToken", res.data.refreshToken);
	}
};

const getOpenId = (): Promise<ApiResponse<LoginResponse>> => {
	console.log("获取 OpenID");
	return new Promise((resolve, reject) => {
		uni.login({
			provider: "weixin",
			success: async (res) => {
				if (res.code) {
					try {
						const response = await post<LoginResponse>("/auth/get_open_id", {
							code: res.code,
						});
						console.log("OpenID 获取成功:", response);
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
		const res = await getOpenId();
		const openId = res.data.openId;

		console.log("OpenID 获取成功:", openId);

		const loginRes = await post<LoginResponse>("/auth/login_by_pwd", {
			...data,
			openId,
			needValidateAdmin: true,
		});

		storeTokens(loginRes);

		return loginRes;
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
					post<LoginResponse>("/auth/login_no_pwd", {
						code: res.code,
						role: userInfo.roleId,
					}).then((res) => {
						console.log("登录响应:", res);
						storeTokens(res);
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
		const res = await getOpenId();
		const openId = res.data.openId;

		console.log("OpenID 获取成功:", openId);

		const loginRes = await post<LoginResponse>("/auth/login_by_token", {
			token,
			openId,
			needValidateAdmin: true,
		});

		storeTokens(loginRes);

		return loginRes;
	} catch (error) {
		console.error("登录链路失败:", error);
		return Promise.reject(error);
	}
};

const refreshAccessToken = async (): Promise<boolean> => {
	const refreshToken = uni.getStorageSync("refreshToken");
	if (!refreshToken) {
		return false;
	}

	try {
		const res = await post<LoginResponse>("/auth/refresh", {
			token: refreshToken,
		});

		if (res.code === 200 && res.data.accessToken) {
			uni.setStorageSync("accessToken", res.data.accessToken);
			console.log("Access Token 已刷新");
			return true;
		}

		return false;
	} catch (err) {
		console.error("刷新 Access Token 失败:", err);
		return false;
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

	const token = uni.getStorageSync("accessToken");

	post("/auth/logout", { token })
		.then((res) => {
			console.log("后端同步登出成功:", res);
		})
		.catch((err) => {
			console.error("后端登出接口异常:", err);
		});

	uni.removeStorageSync("accessToken");
	uni.removeStorageSync("refreshToken");
	uni.removeStorageSync("openId");

	uni.showToast({
		title: "正在退出...",
		icon: "loading",
		duration: 800,
		mask: true,
	});

	setTimeout(() => {
		const jumpType = targetRoute === ROUTES.INDEX ? "relaunch" : "navigate";

		jump(targetRoute, params, jumpType);
	}, 800);
};

export { loginNoPwd, loginByPwd, getOpenId, loginByToken, refreshAccessToken, logOut };
