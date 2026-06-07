<template>
	<view class="main-container">
		<view class="status-bar"></view>

		<scroll-view scroll-y class="content-body" v-if="role === 3">
			<parent-home v-show="activeTab === 0" />
			<parent-user v-show="activeTab === 1" />
		</scroll-view>

		<scroll-view scroll-y class="content-body" v-if="role === 4">
			<teacher-home v-show="activeTab === 0" />
			<teacher-user v-show="activeTab === 1" />
		</scroll-view>

		<view class="custom-tabbar">
			<view
				v-for="(item, index) in tabs"
				:key="index"
				class="tab-item"
				:class="{ active: activeTab === index }"
				@tap="switchTab(index)"
			>
				<view class="icon-box">
					<uni-icons
						:type="activeTab === index ? item.iconActive : item.icon"
						:color="activeTab === index ? '#70a9a2' : '#909399'"
						size="24"
					/>
				</view>
				<text class="tab-label">{{ item.text }}</text>
			</view>
		</view>
	</view>
</template>

<script setup lang="ts">
	import { ref } from "vue";
	import { onLoad } from "@dcloudio/uni-app";
	import { parseData } from "@/utils/common";

	import ParentHome from "../component/parent/home/index.vue";
	import ParentUser from "../component/parent/user/index.vue";

	import TeacherHome from "../component/teacher/home/index.vue";
	import TeacherUser from "../component/teacher/user/index.vue";

	/** 当前登录角色 */
	const role = ref(0);

	onLoad((options) => {
		uni.hideHomeButton();
		if (options) {
			const data = parseData(options.data);
			console.log("roleId:", data);
			role.value = Number(data);
		}
	});

	// 使用 shallowRef 优化组件引用的性能
	const activeTab = ref(0);

	const tabs = [
		{
			text: "首页",
			icon: "home",
			iconActive: "home-filled",
		},
		{
			text: "我的",
			icon: "person",
			iconActive: "person-filled",
		},
	];

	/** 切换标签页 */
	const switchTab = (index: number) => {
		activeTab.value = index;
		// 进阶点：切换时可以触发震动反馈
		uni.vibrateShort({});
	};
</script>

<style lang="scss" scoped src="./index.scss"></style>
