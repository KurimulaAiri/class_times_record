<template>
    <view class="user-container">
        <view class="user-info">
            <view class="avatar">
                <uni-icons type="person" size="60" color="#fff"></uni-icons>
            </view>
            <view class="user-details">
                <view class="user-name">用户名</view>
                <view class="user-phone">138****8888</view>
            </view>
        </view>
        
        <view class="menu-section">
            <view class="menu-item">
                <uni-icons type="settings" size="24" color="#666"></uni-icons>
                <text class="menu-text">设置</text>
                <uni-icons type="right" size="20" color="#999"></uni-icons>
            </view>
            <view class="menu-item">
                <uni-icons type="help" size="24" color="#666"></uni-icons>
                <text class="menu-text">帮助中心</text>
                <uni-icons type="right" size="20" color="#999"></uni-icons>
            </view>
            <view class="menu-item">
                <uni-icons type="info" size="24" color="#666"></uni-icons>
                <text class="menu-text">关于我们</text>
                <uni-icons type="right" size="20" color="#999"></uni-icons>
            </view>
        </view>
    </view>
</template>

<script setup lang="ts">

</script>

<style scoped lang="scss">
.user-container {
    padding: 20px;
    background-color: #f5f5f5;
    min-height: 100vh;
}

.user-info {
    display: flex;
    align-items: center;
    padding: 30px 20px;
    background-color: #70a9a2;
    border-radius: 12px;
    margin-bottom: 20px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.avatar {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    background-color: rgba(255, 255, 255, 0.3);
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 20px;
}

.user-details {
    flex: 1;
}

.user-name {
    font-size: 20px;
    font-weight: bold;
    color: #fff;
    margin-bottom: 8px;
}

.user-phone {
    font-size: 14px;
    color: rgba(255, 255, 255, 0.8);
}

.menu-section {
    background-color: #fff;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.menu-item {
    display: flex;
    align-items: center;
    padding: 20px;
    border-bottom: 1px solid #f0f0f0;
    
    &:last-child {
        border-bottom: none;
    }
    
    &:active {
        background-color: #f5f5f5;
    }
}

.menu-text {
    flex: 1;
    margin-left: 16px;
    font-size: 16px;
    color: #333;
}
</style>