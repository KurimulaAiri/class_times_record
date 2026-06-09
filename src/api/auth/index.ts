/** @description 认证 API 接口模块，提供登录、登出、Token 刷新等认证相关接口 */
import { post } from "@/utils/request";
import { useUserStore } from "@/stores/user";
import { ROUTES } from "@/config/routes";
import { jump, showToast } from "@/utils/common";

/**
 * 将登录响应中的 Token 存储到本地缓存
 * @param res - 登录接口的响应数据，包含 accessToken 和 refreshToken
 * @returns 无返回值
 */
const storeTokens = (res: ApiResponse<LoginResponse>) => {
	if (res.data.accessToken) {
		uni.setStorageSync("accessToken", res.data.accessToken);
	}
	if (res.data.refreshToken) {
		uni.setStorageSync("refreshToken", res.data.refreshToken);
	}
};

/**
 * 获取微信 OpenID，通过微信登录获取 code 后调用后端接口换取 openId
 * @returns 返回包含 openId 的登录响应
 */
const getOpenId = (): Promise<string> => {
	if (uni.getStorageSync("openId")) {
		return Promise.resolve(uni.getStorageSync("openId"));
	}
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
						resolve(response.data.openId);
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

/**
 * 通过账号密码登录，先获取 OpenID 再调用密码登录接口
 * @param data - 登录请求参数，包含账号、密码、OpenID 和是否需要验证管理员权限
 * @returns 返回登录响应数据，包含 Token 信息
 */
const loginByPwd = async (
	data: LoginByPwdRequest,
): Promise<ApiResponse<LoginResponse>> => {
	try {
		const loginRes = await post<LoginResponse>("/auth/login_by_pwd", {
			...data,
			// #ifdef MP-WEIXIN
			platform: "WEIXIN",
			// #endif
		});

		storeTokens(loginRes);

		return loginRes;
	} catch (error) {
		console.error("登录链路失败:", error);
		return Promise.reject(error);
	}
};

/**
 * 免密登录，通过微信 code 和用户角色自动登录并缓存 Token
 * @returns 无返回值
 */
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

/**
 * 通过 Token 登录，先获取 OpenID 再使用已有 Token 进行认证登录
 * @param params - 登录请求参数，包含 Token 和 OpenID
 * @returns 返回登录响应数据，包含新的 Token 信息
 */
const loginByToken = async (
	params: LoginByTokenRequest,
): Promise<ApiResponse<LoginResponse>> => {
	try {
		const loginRes = await post<LoginResponse>("/auth/login_by_token", {
			...params,
			// #ifdef MP-WEIXIN
			platform: "weixin",
			// #endif
		});

		storeTokens(loginRes);

		return loginRes;
	} catch (error) {
		console.error("登录链路失败:", error);
		return Promise.reject(error);
	}
};

/**
 * 使用 refreshToken 刷新 accessToken，成功后更新本地缓存
 * @returns 刷新成功返回 true，否则返回 false
 */
const refreshAccessToken = async (): Promise<boolean> => {
	const refreshToken: string = uni.getStorageSync("refreshToken");
	if (!refreshToken) {
		return false;
	}

	try {
		const res = await post<LoginResponse>("/auth/refresh", {
			token: refreshToken,
		} as RefreshTokenRequest);

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
 * 退出登录，清除本地用户信息和 Token 缓存，通知后端登出，并跳转到指定页面
 * @param targetRoute - 退出后跳转的目标路由，默认为首页
 * @param params - 跳转时携带的参数，默认为 null
 * @returns 无返回值
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

	showToast({ msg: "正在退出...", icon: "loading", duration: 800, mask: true });

	setTimeout(() => {
		const jumpType = targetRoute === ROUTES.INDEX ? "relaunch" : "navigate";

		jump(targetRoute, params, jumpType);
	}, 800);
};

const getUserAuthInfoByTeacherId = async (
	data : GetUserAuthInfoByTeacherIdRequest
): Promise<ApiResponse<GetUserAuthInfoByTeacherIdResponse>> => {
	try {
		const res = await post<GetUserAuthInfoByTeacherIdResponse>("/auth/get_user_auth_info_by_teacher_id", {
			...data,
		});
		return res;
	} catch (error) {
		console.error("获取用户认证信息失败:", error);
		return Promise.reject(error);
	}
};

export {
	loginNoPwd,
	loginByPwd,
	getOpenId,
	loginByToken,
	refreshAccessToken,
	logOut,
	getUserAuthInfoByTeacherId,
};
