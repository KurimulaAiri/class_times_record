<template>
	<view class="user-container">
		<view class="header-bg">
			<view class="user-info-row">
				<image
					class="avatar"
					src="/static/icon/avatar.svg"
					mode="aspectFill"
				></image>
				<view class="location-tag">
					<uni-icons type="location-filled" size="14" color="#ccc"></uni-icons>
				</view>
				<button class="manage-btn">管理学员</button>
			</view>
		</view>

		<view class="grid-menu">
			<view class="grid-item" v-for="(item, index) in gridList" :key="index">
				<view class="grid-icon-box" :style="{ backgroundColor: item.bgColor }">
					<uni-icons :type="item.icon" size="24" color="#fff"></uni-icons>
				</view>
				<text class="grid-label">{{ item.name }}</text>
			</view>
		</view>

		<view class="list-section">
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
				<uni-icons type="right" size="16" color="#eee"></uni-icons>
			</view>
		</view>
	</view>
</template>

<script setup lang="ts">
	import { ref } from "vue";

	// 顶部四个图标数据
	const gridList = ref([
		{ name: "余额", icon: "wallet-filled", bgColor: "#86e1b6" },
		{ name: "考勤码", icon: "micoff-filled", bgColor: "#7cb5ff" }, // 模拟二维码图标
		{ name: "我的订单", icon: "compose", bgColor: "#85e4f1" },
		{ name: "优惠券", icon: "gift-filled", bgColor: "#ffb37c" },
	]);

	// 下方列表数据
	const subMenuList = ref([
		{ menuName: "礼品兑换", icon: "gift", color: "#86e1b6" },
		{ menuName: "兑换记录", icon: "star-filled", color: "#7cb5ff" },
		{ menuName: "积分记录", icon: " wallet", color: "#ffb37c" },
		{ menuName: "成绩单", icon: " paperplane-filled", color: "#7adcf0" },
		{ menuName: "考勤记录", icon: " checkbox-filled", color: "#b999f7" },
		{ menuName: "机构通知", icon: " notification-filled", color: "#86e1b6" },
		{ menuName: "分享小程序", icon: " redo-filled", color: "#ffb37c" },
	]);
</script>
<style scoped lang="scss" src="./index.scss"></style>
