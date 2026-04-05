<template>
    <view>
        <view class="content">
            <view class="login-form">
                <view class="login-form-title">
                    {{ role === "teacher" ? "教师" : "家长" }}登录
                </view>
                <view class="login-form-content">
                    <view class="login-form-item">
                        <view class="login-form-item-label">
                            手机号
                        </view>
                        <view class="login-form-item-input">
                            <input type="text" placeholder="请输入手机号" />
                        </view>
                    </view>
                    <view class="login-form-item">
                        <view class="login-form-item-label">
                            密码
                        </view>
                        <view class="login-form-item-input">
                            <input type="password" placeholder="请输入密码" />
                        </view>
                    </view>
                    <view class="login-form-item btn-wrapper">
                        <view class="login-btn">
                            登录
                        </view>
                    </view>
                </view>
            </view>
        </view>
    </view>
</template>

<script setup lang="ts">
import { onLoad } from "@dcloudio/uni-app";
import { ref } from "vue";
import { jump, parseData } from "@/utils/common";

const role = ref("");

onLoad((options) => {
    if (options) {
        const data = parseData(options.data);
        console.log(data.role);
        role.value = data.role;
    }
});
</script>

<style scoped lang="scss" src="./index.scss">

</style>