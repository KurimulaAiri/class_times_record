<template>
  <view class="user-container">
    <view class="user-header-card">
      <view class="user-info">
        <view class="avatar-wrapper">
          <image class="avatar-img" src="/static/avatar.png" mode="aspectFill"></image>
        </view>
        <view class="user-details">
          <view class="user-name">蔡福全</view>
          <view class="user-phone">手机号：15260111193</view>
        </view>
        <uni-icons type="right" size="18" color="rgba(255,255,255,0.7)"></uni-icons>
      </view>
    </view>

    <view class="school-card" hover-class="item-hover">
      <view class="left">
        <view class="icon-circle">
          <uni-icons type="shop" size="20" color="#66cdaa"></uni-icons>
        </view>
        <text class="label">当前校区</text>
      </view>
      <view class="right">
        <text class="school-name">甲古书院龙文校区</text>
        <uni-icons type="right" size="16" color="#ccc"></uni-icons>
      </view>
    </view>

    <view class="menu-section">
      <view 
        class="menu-item" 
        v-for="(item, index) in subMenuList" 
        :key="index"
        @tap="jump(item.path)"
        hover-class="item-hover"
      >
        <view class="item-left">
          <uni-icons :type="item.icon" size="22" color="#555"></uni-icons>
          <text class="menu-text">{{ item.menuName }}</text>
        </view>
        <uni-icons type="right" size="16" color="#ddd"></uni-icons>
      </view>
    </view>

    <view class="app-guide-card" hover-class="item-hover">
      <view class="item-left">
        <view class="app-icon">
          <uni-icons type="download" size="14" color="#fff"></uni-icons>
        </view>
        <text class="menu-text">更多功能请使用APP</text>
      </view>
      <uni-icons type="right" size="16" color="#ddd"></uni-icons>
    </view>

    <view class="footer-actions">
      <view class="action-item" hover-class="item-hover">切换账号</view>
      <view class="action-item logout" hover-class="item-hover">退出登录</view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { jump } from "@/utils/common";

// 同样适配 Menu 接口格式
const subMenuList = ref([
  { id: 201, menuName: '我的课表', icon: 'calendar', path: '', isVisible: true },
  { id: 202, menuName: '一对一约课', icon: 'person', path: '', isVisible: true },
  { id: 203, menuName: '我的地推码', icon: 'scan', path: '', isVisible: true }
]);
</script>

<style scoped lang="scss" src="./index.scss"></style>