<template>
	<view class="content">
		<view class="entry-select-form">
			<view class="entry-select-form-title"> 请选择身份 </view>
			<view class="entry-select-btn-group">
				<!-- 添加了 hover-class 提升交互感 -->
				<view
					class="entry-select-btn"
					hover-class="btn-hover-opacity"
					@click="jump(ROUTES.LOGIN, { role: 3 })"
				>
					家长端
				</view>
				<view
					class="entry-select-btn"
					hover-class="btn-hover-opacity"
					@click="jump(ROUTES.LOGIN, { role: 4 })"
				>
					教师端
				</view>
			</view>
		</view>
		<!-- 新增：版本号显示 -->
		<view class="version-text"> Version {{ version }} </view>
	</view>
</template>

<script setup lang="ts">
	import { jump, parseData } from "@/utils/common/index";
	import { ROUTES } from "@/config/routes";
	import { onLoad } from "@dcloudio/uni-app";
	import { ref } from "vue";
	import { useUserStore } from "@/stores/user";
	import { loginByToken } from "@/api/auth";

	const version = ref("1.0.0"); // 默认版本号

	onLoad((options: any) => {
		if (options.data) {
			const data: any = parseData(options.data);
			console.log("options.data:", data);
			if (data && data.role) {
				jump(ROUTES.LOGIN, { role: data.role });
			}
		}

		console.log("onLoad 执行");
		const refreshToken = uni.getStorageSync("refreshToken");
		if (refreshToken) {
			loginByToken(refreshToken).then((res) => {
				if (res.code === 200) {
					console.log("登录成功:", res);
					const userStore = useUserStore();
					userStore.setUserInfo(res.data.user);
					jump(ROUTES.MAIN_INDEX, res.data.user.roleId, "relaunch");
				}
			});
		}

		// #ifdef APP-PLUS
		// 将 window 强转为 any 即可访问 plus
		(window as any).plus.runtime.getProperty(
			(window as any).plus.runtime.appid,
			(widgetInfo: any) => {
				version.value = widgetInfo.version ?? "1.0.0";
			},
		);
		// #endif

		// #ifdef MP-WEIXIN
		// 仅在微信小程序读取
		const accountInfo = uni.getAccountInfoSync();
		version.value = accountInfo.miniProgram.version || "1.0.0";
		// #endif

		// #ifdef H5
		// H5 无法直接读取，通常从 package.json 手动同步或固定
		version.value = "1.0.0";
		// #endif
	});
</script>

<style scoped lang="scss" src="./index.scss"></style>
