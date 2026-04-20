<template>
  <view class="main-container">
    <view class="status-bar"></view>

    <scroll-view scroll-y class="content-body">
      <home v-show="activeTab === 0" />
      <user v-show="activeTab === 1" />
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
            :color="activeTab === index ? '#2979ff' : '#909399'" 
            size="24"
          />
        </view>
        <text class="tab-label">{{ item.text }}</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
	import { ref, shallowRef } from "vue";
	import home from "../component/home/index.vue";
	import user from "../component/user/index.vue";

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

	const switchTab = (index: number) => {
		activeTab.value = index;
		// 进阶点：切换时可以触发震动反馈
		uni.vibrateShort({});
	};
</script>

<style lang="scss" scoped src="./index.scss"></style>
