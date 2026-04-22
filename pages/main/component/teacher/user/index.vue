<template>
	<view class="mine-container">
        <view class="header"></view>
		<view class="user-section" @tap="handleAction('profile')">
			<image
				class="avatar"
				src="/static/icon/avatar.svg"
				mode="aspectFill"
			></image>
			<view class="info">
				<text class="name">蔡福全</text>
				<text class="phone">手机号：15260111193</text>
			</view>
			<uni-icons type="right" size="18" color="#ccc"></uni-icons>
		</view>

		<view class="margin-gap"></view>
		<view class="list-item" @tap="handleAction('school')">
			<view class="left-content">
				<uni-icons type="shop" size="22" color="#66cdaa"></uni-icons>
				<text class="label">当前校区</text>
			</view>
			<view class="right-content">
				<text class="value">甲古书院龙文校区</text>
				<uni-icons type="right" size="18" color="#ccc"></uni-icons>
			</view>
		</view>

		<view class="margin-gap"></view>
		<view class="menu-group">
			<view
				v-for="(item, index) in subMenuList"
				:key="item.id"
				class="list-item"
				:class="{ 'border-bottom': index !== subMenuList.length - 1 }"
				@tap="navigateTo(item.path)"
				hover-class="item-hover"
			>
				<view class="left-content">
					<uni-icons :type="item.icon" size="22" color="#444"></uni-icons>
					<text class="label">{{ item.menuName }}</text>
				</view>
				<uni-icons type="right" size="18" color="#ccc"></uni-icons>
			</view>
		</view>

		<view class="margin-gap"></view>
		<view class="list-item" @tap="handleAction('app')">
			<view class="left-content">
				<view class="app-icon">
					<uni-icons type="phone" size="14" color="#fff"></uni-icons>
				</view>
				<text class="label">更多功能请使用APP</text>
			</view>
			<uni-icons type="right" size="18" color="#ccc"></uni-icons>
		</view>

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

	// 按照你的 Menu 接口格式定义的子菜单
	const subMenuList = ref([
		{
			id: 101,
			menuName: "我的课表",
			icon: "calendar",
			iconType: 1,
			path: "/pages/schedule/index",
			isVisible: true,
		},
		{
			id: 102,
			menuName: "一对一约课",
			icon: "person",
			iconType: 1,
			path: "/pages/book/index",
			isVisible: true,
		},
		{
			id: 103,
			menuName: "我的地推码",
			icon: "scan",
			iconType: 1,
			path: "/pages/qrcode/index",
			isVisible: true,
		},
	]);

	const navigateTo = (path: string) => {
		if (path) uni.navigateTo({ url: path });
	};

	const handleAction = (type) => {
		console.log("点击了操作:", type);
		// 实现具体的切换账号或退出逻辑
	};
</script>

<style scoped src="./index.scss"></style>
