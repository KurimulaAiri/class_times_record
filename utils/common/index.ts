import { post } from "@/utils/request";

const jump = (path: string, data?: any) => {
	// 关键点：使用 encodeURIComponent 包装 JSON 字符串
	const dataStr = encodeURIComponent(JSON.stringify(data));

	uni.navigateTo({
		url: `${path}?data=${dataStr}`,
	});
};

const login = () => {
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

/**
 * 重写类型 T 中的属性 K
 * @param T 原类型
 * @param K 要重写的属性键名 (联合类型)
 * @returns 重写后的属性映射对象
 */
type Overwrite<T, U> = Omit<T, keyof U> & U;

/**
 * 专门用于表单：挑选属性并允许部分字段为 null
 * @param T 原类型
 * @param K 要重写的属性键名 (联合类型)
 * @returns 重写后的属性映射对象
 */
type FormModel<T, K extends keyof T> = Overwrite<
	Pick<T, K>,
	{
		[P in K]?: T[P] | null;
	}
>;

export { jump, login };

export type { Overwrite, FormModel };
