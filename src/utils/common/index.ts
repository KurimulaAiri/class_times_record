/** @description 通用工具函数库，提供页面跳转、消息提示、数据解析、账号切换等基础能力 */
import { ref } from "vue";
import type { Ref } from "vue";
import { onLoad } from "@dcloudio/uni-app";
import { ROUTES, PagePath } from "@/config/routes";
import { logOut } from "@/api/auth";

/**
 * 这里的 GlobalPagePath 提供提示
 * (string & {}) 允许接受任何字符串，且不会让 FlexiblePath 塌陷为普通的 string
 */
type FlexiblePath = PagePath | (string & {});

/**
 * 跳转页面
 * @param path 目标页面路径
 * @param data 要传递的参数 (支持普通的 URL 传参 或 EventChannel 大对象传参)
 * @param type 跳转类型，默认 navigate，可选 redirect 或 relaunch
 * @param useEventChannel 是否使用 EventChannel 管道传递数据 (默认 false，仅在 type 为 'navigate' 时有效)
 */
const jump = (
	path: FlexiblePath,
	data?: any,
	type: "redirect" | "navigate" | "relaunch" = "navigate",
	useEventChannel: boolean = false, // 新增：默认关闭高级管道传参
) => {
	// 1. 统一处理路径格式（补齐开头的 /）
	let targetPath = path.trim();
	if (!targetPath.startsWith("/")) {
		targetPath = "/" + targetPath;
	}

	// 2. 运行时校验：检查处理后的路径是否存在于 ROUTES 定义中
	const allValidPaths: string[] = Object.values(ROUTES);
	const isExist = allValidPaths.includes(targetPath);

	if (!isExist) {
		console.error(
			`[Jump Error]: 路径 "${targetPath}" 不在 pages.json 路由定义中`,
		);
		showToast("跳转路径错误", "error");
		return; // 拦截跳转
	}

	// 3. 处理传统的 URL 传参字符串 (在不使用 EventChannel 时作为兜底)
	const dataStr = encodeURIComponent(JSON.stringify(data));

	switch (type) {
		case "redirect":
			console.log("重定向到", targetPath, "参数", dataStr);
			uni.redirectTo({
				url: `${targetPath}?data=${dataStr}`,
			});
			return;

		case "relaunch":
			console.log("重新启动应用，跳转到", targetPath, "参数", dataStr);
			uni.reLaunch({
				url: `${targetPath}?data=${dataStr}`,
			});
			return;

		case "navigate":
			// 💡 核心改造：如果开启了 EventChannel 且带有数据
			if (useEventChannel && data !== undefined && data !== null) {
				console.log(
					"通过 EventChannel 管道跳转到",
					targetPath,
					"数据对象:",
					data,
				);
				uni.navigateTo({
					url: targetPath, // 💡 路径保持纯净，不再拼接超长字符串
					success: (res) => {
						// 向上发派名为 'acceptClassData' 的事件，将整个大对象完整送出
						res.eventChannel.emit("acceptClassData", data);
					},
					fail: (err) => {
						console.error("[Jump EventChannel Error]: 跳转失败", err);
					},
				});
			} else {
				// 传统 URL 传参模式兜底
				console.log("通过传统 URL 跳转到", targetPath, "参数", dataStr);
				uni.navigateTo({
					url: `${targetPath}?data=${dataStr}`,
				});
			}
			return;
	}
};

/**
 * 显示消息提示
 * @param msg 提示文字
 * @param icon 图标类型，默认 none
 * @param duration 显示时长（毫秒），默认 2000
 * @param mask 是否显示透明蒙层，防止触摸穿透，默认 false
 */
const showToast = (
	msg: string,
	icon: "none" | "success" | "loading" | "error" = "none",
	duration: number = 2000,
	mask: boolean = false,
) => {
	setTimeout(() => {
		uni.showToast({ title: msg, icon, duration, mask });
	}, 200);
};

/**
 * 解析 URL 查询参数中的 JSON 字符串
 * @param dataStr 要解析的 JSON 字符串
 * @returns 解析后的对象
 */
const parseData = <T>(dataStr: any): T | undefined => {
	// 1. 彻底拦截真正的 undefined, null 和 空字符串
	if (dataStr === undefined || dataStr === null || dataStr === "") {
		return undefined;
	}

	// 2. 拦截 字符串形式的 "undefined" 或 "null" (URL传参常出的包)
	if (dataStr === "undefined" || dataStr === "null") {
		return undefined;
	}

	try {
		// 3. 解码并解析
		const decoded = decodeURIComponent(dataStr);
		return JSON.parse(decoded) as T;
	} catch (e) {
		console.error("JSON解析失败，数据内容为:", dataStr, e);
		return undefined; // 或者返回 {} 根据业务需求决定
	}
};

/**
 * 专门用于接收通过 jump 传过来的大对象参数（兼容 EventChannel 与 传统URL传参）
 * @param callback 接收到数据后的回调函数
 * @returns 返回一个包含响应式 data 的对象
 */
const usePageData = <T = any>(
	callback?: (data: T) => void,
): { data: Ref<T | null> } => {
	const data = ref<T | null>(null) as Ref<T | null>;

	onLoad((options) => {
		let hasReceived = false;

		// 核心通道 1：优先尝试通过高级的 EventChannel 管道接收数据
		try {
			const pages = getCurrentPages();
			if (pages && pages.length > 0) {
				const currentPage = pages[pages.length - 1] as any;
				const eventChannel = currentPage?.getOpenerEventChannel?.();

				if (eventChannel && typeof eventChannel.on === "function") {
					eventChannel.on("acceptClassData", (res: T) => {
						if (res) {
							hasReceived = true;
							data.value = res;
							if (callback) callback(res);
						}
					});
				}
			}
		} catch (e) {
			console.warn(
				"[usePageData Warning]: EventChannel 获取失败，尝试切换 URL 兜底解析",
				e,
			);
		}

		// 核心通道 2：如果 EventChannel 没拿到（比如走的是 redirect/relaunch 或传统模式），则通过 URL 兜底解析
		if (
			!hasReceived &&
			options &&
			options.data &&
			options.data !== "undefined"
		) {
			try {
				const decoded = decodeURIComponent(options.data);
				const parsed = JSON.parse(decoded) as T;
				if (parsed) {
					data.value = parsed;
					if (callback) callback(parsed);
				}
			} catch (e) {
				console.error("[usePageData Error]: URL 兜底参数 JSON 解析失败", e);
			}
		}
	});

	return {
		data,
	};
};

/**
 * 切换账号
 * @param role 退出账号的角色，会自动跳转到该角色的登录页
 */
const switchUser = (role: number) => {
	logOut(ROUTES.INDEX, { role });
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

export { jump, parseData, switchUser, usePageData, showToast };

export type { Overwrite, FormModel };
