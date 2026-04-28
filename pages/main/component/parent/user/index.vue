<template>
	<view class="user-container">
		<view class="header-section">
			<view class="header-left">
				<image
					class="avatar"
					src="@/static/icon/avatar.svg"
					mode="aspectFill"
				></image>
				<view class="user-text-info">
					<text class="user-name">{{ userInfo.identityInfo.username }}</text>
					<view class="location-row">
						<uni-icons
							type="location-filled"
							size="14"
							color="#ccc"
						></uni-icons>
						<text class="location-text">甲古书院龙文校区</text>
					</view>
				</view>
			</view>
			<button
				class="manage-btn"
				hover-class="manage-btn-hover"
				@tap="jump('/pages/main/manage-student/index', studentList)"
			>
				管理学员
			</button>
		</view>

		<view class="grid-menu">
			<view class="grid-item" v-for="(item, index) in gridList" :key="index">
				<view class="grid-icon-box" :style="{ backgroundColor: item.bgColor }">
					<uni-icons :type="item.icon" size="24" color="#fff"></uni-icons>
				</view>
				<text class="grid-label">{{ item.name }}</text>
			</view>
		</view>

		<view class="list-card-bg">
			<view
				class="list-item"
				v-for="(item, index) in subMenuList"
				:key="index"
				hover-class="item-hover"
			>
				<view class="item-left">
					<view class="icon-wrap" :style="{ backgroundColor: item.color }">
						<uni-icons :type="item.icon" size="18" color="#fff"></uni-icons>
					</view>
					<text class="item-text">{{ item.menuName }}</text>
				</view>
				<uni-icons type="right" size="16" color="#bbb"></uni-icons>
			</view>
		</view>

		<view class="footer-actions">
			<view
				class="action-btn border-bottom"
				@tap="handleAction('switch')"
				hover-class="item-hover"
			>
				<text>切换账号</text>
			</view>
			<view
				class="action-btn"
				@tap="handleAction('logout')"
				hover-class="item-hover"
			>
				<text>退出登录</text>
			</view>
		</view>
	</view>
</template>

<script setup lang="ts">
	import { ref, onMounted } from "vue";
	import { getStudentListByParentId } from "@/api/student";
	import { useUserStore } from "@/stores/user";
	import { jump } from "@/utils/common";
	import { logOut } from "@/api/auth";
	import { Student } from "@/types/student";

	const userStore = useUserStore();
	const userInfo = userStore.userInfo;

	const studentList = ref<Student[]>([]);

	// 1. 顶部四个图标数据优化
	const gridList = ref([
		{ name: "余额", icon: "wallet-filled", bgColor: "#86e1b6" },
		{ name: "考勤码", icon: "scan", bgColor: "#7cb5ff" }, // 改为扫描图标模拟二维码
		{ name: "我的订单", icon: "compose", bgColor: "#7adcf0" }, // 微调颜色
		{ name: "优惠券", icon: "gift-filled", bgColor: "#ffb37c" },
	]);

	// 2. 下方列表数据优化（图标和颜色更贴合原图）
	const subMenuList = ref([
		{ menuName: "礼品兑换", icon: "gift", color: "#86e1b6" },
		{ menuName: "兑换记录", icon: "star-filled", color: "#7cb5ff" },
		{ menuName: "积分记录", icon: "wallet", color: "#ffb37c" },
		{ menuName: "成绩单", icon: "paperplane-filled", color: "#7adcf0" },
		{ menuName: "考勤记录", icon: "checkbox-filled", color: "#b999f7" },
		{ menuName: "机构通知", icon: "notification-filled", color: "#86e1b6" },
		{ menuName: "分享小程序", icon: "redo-filled", color: "#ffb37c" },
	]);

	const handleAction = (type: string) => {
		console.log("点击了操作:", type);
		// 实现具体的切换账号或退出逻辑
		switch (type) {
			case "switch":
				// 切换账号逻辑
				break;
			case "logout":
				logOut();
				break;
			default:
				break;
		}
	};

	onMounted(() => {
		getStudentListByParentId({
			parentId: 1,
			currentPage: 1,
			pageSize: 10,
		}).then((res) => {
			studentList.value = res.data.list;
			console.log("获取学生列表", res);
		});
	});
</script>
<style scoped lang="scss" src="./index.scss"></style>
