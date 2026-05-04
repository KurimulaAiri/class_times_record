<template>
	<div>
		<view class="content">
			<view class="entry-select-form">
                <view class="entry-select-form-title">
                    请选择身份
                </view>
				<view class="entry-select-btn-group">
					<view class="entry-select-btn" @click="jump(ROUTES.LOGIN, { role: 3 })">
						家长端
					</view>
					<view class="entry-select-btn" @click="jump(ROUTES.LOGIN, { role: 4 })">
						老师师端
					</view>
				</view>
			</view>
		</view>
	</div>
</template>

<script setup lang="ts">
	import { jump } from "@/utils/common/index";
	import { ROUTES } from "@/config/routes";
	import { onLoad } from "@dcloudio/uni-app";
	import { useUserStore } from "@/stores/user";
	import { loginByToken } from "@/api/auth";

	onLoad(() => {
		console.log("onLoad 执行");
		const token = uni.getStorageSync('token');
		if (token) {
			loginByToken(token).then((res) => {
				if (res.code === 200) {
					console.log("登录成功:", res);
					// 登录成功后，根据角色跳转不同的页面跳转
					const userStore = useUserStore();
					userStore.setUserInfo(res.data.user);
					jump(ROUTES.MAIN_INDEX, res.data.user.roleId, "relaunch");
				}
			});
		}
	})

</script>

<style scoped lang="scss" src="./index.scss"></style>
