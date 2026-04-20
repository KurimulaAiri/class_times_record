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
			<view class="grid-item" v-for="(item, index) in menuList" :key="index" @tap="jump(item.path)">
				<view class="icon-wrapper" :style="{ backgroundColor: item.bgColor }">
					<uni-icons :type="item.icon" size="30" color="#fff"></uni-icons>
				</view>
				<text class="grid-label">{{ item.menuName }}</text>
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
	</view>
</template>

<script setup lang="ts">
	import { getMenuList } from "@/api/menu";
	import { ref, onMounted } from "vue";
	import { jump } from "@/utils/common";

	onMounted(() => {
		getMenuList({
			currentPage: 1,
			pageSize: 100,
		}).then((res) => {
			console.log("获取菜单列表",res);
			menuList.value = res.data.menus;
		});
	});

	const menuList = ref<Menu[]>([]);
</script>

<style scoped lang="scss" src="./index.scss"></style>
