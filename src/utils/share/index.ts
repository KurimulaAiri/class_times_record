// utils/share/index.ts
export default {
	// 1. 全局默认分享给好友
	onShareAppMessage(res) {
		return {
			title: "课时管理KA", // 默认全局标题
			path: "/pages/index/index", // 默认全局路径（首页）
			imageUrl: "/static/default-share.png", // 默认全局分享图
		};
	},
	// 2. 全局默认分享到朋友圈
	onShareTimeline() {
		return {
			title: "课时管理KA",
			query: "from=global_timeline",
		};
	},
};
