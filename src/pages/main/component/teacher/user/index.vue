<template>
	<view class="mine-container">
		<view class="user-section" @tap="handleAction('profile')">
			<image
				class="avatar"
				src="/static/icon/avatar.svg"
				mode="aspectFill"
			></image>
			<view class="info">
				<view class="name-wrapper">
					<text class="name">{{
						userStore.userInfo?.identityInfo.username
					}}</text>
					<text v-if="userStore.userInfo?.roleId === 4 ? userStore.userInfo?.admin : false" class="admin-tag"
						>管理员</text
					>
				</view>
				<text class="phone">{{ 1233 }}</text>
			</view>
			<uni-icons type="right" size="18" color="#ccc"></uni-icons>
		</view>

		<view class="margin-gap"></view>
		<view
			class="list-item"
			@tap="handleAction('school')"
			hover-class="item-hover"
		>
			<view class="left-content">
				<uni-icons type="shop" size="22" color="#66cdaa"></uni-icons>
				<text class="label">当前校区</text>
			</view>
			<view class="right-content">
				<text class="value">{{
					userStore.userInfo?.roleId === 4
						? userStore.userInfo?.identityInfo.institution?.institutionName ||
							"未填写"
						: "身份错误"
				}}</text>
				<uni-icons type="right" size="18" color="#ccc"></uni-icons>
			</view>
		</view>

		<view class="margin-gap"></view>
		<view class="menu-group">
			<template v-for="(item, index) in subMenuList" :key="item.id">
				<view
					v-if="item.isVisible"
					class="list-item"
					:class="{ 'border-bottom': index !== subMenuList.length - 1 }"
					@tap="jump(item.path)"
					hover-class="item-hover"
				>
					<view class="left-content">
						<uni-icons :type="item.icon" size="22" color="#444"></uni-icons>
						<text class="label">{{ item.menuName }}</text>
					</view>
					<uni-icons type="right" size="18" color="#ccc"></uni-icons>
				</view>
			</template>
		</view>

		<view class="margin-gap"></view>
		<!-- <view class="list-item" @tap="handleAction('app')">
			<view class="left-content">
				<view class="app-icon">
					<uni-icons type="phone" size="14" color="#fff"></uni-icons>
				</view>
				<text class="label">更多功能请使用APP</text>
			</view>
			<uni-icons type="right" size="18" color="#ccc"></uni-icons>
		</view> -->

		<view class="margin-gap"></view>
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
	import { ref } from "vue";
	import { logOut } from "@/api/auth";
	import { useUserStore } from "@/stores/user";
	import { jump, switchUser } from "@/utils/common";
	import { ROUTES } from "@/config/routes";
	import { getInstitutionById } from "@/api/institution";

	const userStore = useUserStore();

	/** 子菜单列表 */
	const subMenuList = ref([
		{
			id: 101,
			menuName: "我的课表",
			icon: "calendar",
			iconType: 1,
			path: ROUTES.MY_SCHEDULE,
			isVisible: true,
		},
		{
			id: 102,
			menuName: "管理老师",
			icon: "person",
			iconType: 1,
			path: ROUTES.MANAGE_TEACHER,
			isVisible: true,
		},
		{
			id: 103,
			menuName: "一对一约课",
			icon: "person",
			iconType: 1,
			path: "/pages/book/index",
			isVisible: false,
		},
		{
			id: 104,
			menuName: "我的地推码",
			icon: "scan",
			iconType: 1,
			path: "/pages/qrcode/index",
			isVisible: false,
		},
	]);
	/** 处理用户操作 */
	const handleAction = (type: string) => {
		console.log("点击了操作:", type);

		switch (type) {
			case "profile":
				jump(ROUTES.USER_PROFILE);
				break;
			case "school":
				jump(ROUTES.INSTITUTION_DETAIL);
				break;
			case "switch":
				// 切换账号逻辑
				uni.showModal({
					title: "切换账号",
					content: "确定切换账号吗？",
					success({ confirm, cancel }) {
						if (confirm) {
							switchUser(4);
						}
					},
				});
				break;
			case "logout":
				uni.showModal({
					title: "退出登录",
					content: "确定退出登录吗？",
					confirmColor: "#ff5252",
					success({ confirm, cancel }) {
						if (confirm) {
							logOut();
						}
					},
				});
				break;
			default:
				break;
		}
	};

	uni.$on("needRefreshUser", async () => {
		const newIns = await getInstitutionById({
			institutionId:
				userStore.userInfo?.roleId === 4
					? userStore.userInfo?.identityInfo.institutionId
					: 0,
		});
		if (newIns) {
			const currentUser = userStore.userInfo;
			if (currentUser?.roleId === 4) {
				currentUser.identityInfo.institution = newIns;
			}
			const newUser = { ...currentUser } as UserResponse;
			userStore.setUserInfo(newUser);
		}
	});
</script>

<style scoped src="./index.scss"></style>
