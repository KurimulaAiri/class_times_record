import { post } from "@/utils/request";

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
                        resolve(response);
                    } catch (err) {
                        reject(err);
                    }
                } else {
                    reject(res);
                }
            },
            fail: (err) => reject(err)
        });
    });
};

const loginByPwd = async (data: LoginRequest): Promise<ApiResponse<LoginResponse>> => {
    try {
        // 1. 等待获取 OpenID
        const res = await getOpenId();
        const openId = res.data.openId;
        
        console.log("OpenID 获取成功:", openId);

        // 2. 发起最终登录请求并返回结果
        return await post<LoginResponse>("/auth/login_by_pwd", { 
            ...data, 
            openId 
        });
    } catch (error) {
        console.error("登录链路失败:", error);
        return Promise.reject(error);
    }
};

const loginNoPwd = () => {
	uni.login({
		provider: "weixin",
		success: (res) => {
			if (res.code) {
				// 将 code 发送到你的后端服务器
				post<LoginResponse>("/auth/login_no_pwd", {
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

export { loginNoPwd, loginByPwd, getOpenId };
