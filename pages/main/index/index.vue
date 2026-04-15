<template>
	<view class="container">
		<view class="banner-box">
			<view class="banner-content">
				<view class="title">在线请假 在线约课</view>
				<view class="sub-title">上课记录、课表安排随时查询</view>
				<view class="tag">及时收到推送通知和重要消息</view>
			</view>
			<image
				class="banner-img"
				src="/static/icon/books.svg"
				mode="aspectFit"
			></image>
		</view>

		<view class="grid-container">
			<view class="grid-item" v-for="(item, index) in menuList" :key="index">
				<view class="icon-wrapper" :style="{ backgroundColor: item.bgColor }">
					<uni-icons :type="item.icon" size="30" color="#fff"></uni-icons>
				</view>
				<text class="grid-label">{{ item.name }}</text>
			</view>
		</view>

		<view class="wechat-notice">
			<view class="left-info">
				<image class="wechat-icon" src="/static/icon/wechat.svg"></image>
				<view class="text-group">
					<view class="main-text">微信公众号</view>
					<view class="sub-text">接收学员动态推送通知</view>
				</view>
			</view>
			<button class="follow-btn">去关注</button>
		</view>

		<view class="tab-bar">
			<view class="tab-item active">
				<uni-icons type="home-filled" size="24" color="#2979ff"></uni-icons>
				<text>首页</text>
			</view>
			<view class="tab-item">
				<uni-icons type="person" size="24" color="#666"></uni-icons>
				<text>我的</text>
			</view>
		</view>
	</view>
</template>

<script setup lang="ts">
	import { ref } from "vue";



	const menuList = ref([
		{ name: "课后作业", icon: "compose", bgColor: "#76d6bc" },
		{ name: "我的课程", icon: "book", bgColor: "#ffb352" },
		{ name: "上课记录", icon: "list", bgColor: "#ff8e58" },
		{ name: "打卡作业", icon: "calendar", bgColor: "#ff9c73" },
		{ name: "评价老师", icon: "staff", bgColor: "#88e2bb" },
		{ name: "在线约课", icon: "calendar-filled", bgColor: "#6fa5ff" },
		{ name: "请假", icon: "minus-filled", bgColor: "#8bd16b" },
		{ name: "课后点评", icon: "chatboxes", bgColor: "#80d4ff" },
		{ name: "机构活动", icon: " notification", bgColor: "#7daaff" },
		{ name: "微官网", icon: "world", bgColor: "#f65c92" },
	]);
</script>

<style scoped lang="scss" src="./index.scss"></style>
