import { ROUTES, PagePath } from '@/config/routes';

/**
 * 这里的 GlobalPagePath 提供提示
 * (string & {}) 允许接受任何字符串，且不会让 GlobalPagePath 塌陷为普通的 string
 */
type FlexiblePath = PagePath | (string & {});

/**
 * 跳转页面
 * @param path 目标页面路径
 * @param data 要传递的参数
 * @param type 跳转类型，默认 navigate，可选 redirect 或 relaunch
 */
const jump = (path: FlexiblePath, data?: any, type: "redirect" | "navigate" | "relaunch" = "navigate") => {

	// 1. 统一处理路径格式（补齐开头的 /）
    let targetPath = path.trim();
    if (!targetPath.startsWith('/')) {
        targetPath = '/' + targetPath;
    }

    // 2. 运行时校验：检查处理后的路径是否存在于 ROUTES 定义中
    const allValidPaths: string[] = Object.values(ROUTES);
    const isExist = allValidPaths.includes(targetPath);

    if (!isExist) {
        console.error(`[Jump Error]: 路径 "${targetPath}" 不在 pages.json 路由定义中`);
        uni.showToast({
            title: '跳转路径错误',
            icon: 'error'
        });
        return; // 拦截跳转
    }

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
