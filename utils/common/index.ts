/**
 * 跳转页面
 * @param path 目标页面路径
 * @param data 要传递的参数
 * @param type 跳转类型，默认 navigate，可选 redirect 或 relaunch
 */
const jump = (path: string, data?: any, type: "redirect" | "navigate" | "relaunch" = "navigate") => {
	// 关键点：使用 encodeURIComponent 包装 JSON 字符串
	const dataStr = encodeURIComponent(JSON.stringify(data));

	switch (type) {
		case "redirect":
			console.log("重定向到", path, "参数", dataStr);
			uni.redirectTo({
				url: `${path}?data=${dataStr}`,
			});
			return;
		case "navigate":
			console.log("跳转到", path, "参数", dataStr);
			uni.navigateTo({
				url: `${path}?data=${dataStr}`,
			});
			return;
		case "relaunch":
			console.log("重新启动应用，跳转到", path, "参数", dataStr);
			uni.reLaunch({
				url: `${path}?data=${dataStr}`,
					});
			return;
	}
};

/**
 * 解析 URL 查询参数中的 JSON 字符串
 * @param dataStr 要解析的 JSON 字符串
 * @returns 解析后的对象
 */
const parseData = (dataStr: string) => {
	return JSON.parse(decodeURIComponent(dataStr));
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

export { jump, parseData };

export type { Overwrite, FormModel };
