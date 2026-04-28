<template>
	<view>
		<view class="content">
			<view class="login-form">
				<view class="login-form-title">
					{{ role === 4 ? "教师" : "家长" }}登录
				</view>
				<view class="login-form-content">
					<view class="login-form-item">
						<view class="login-form-item-label"> 账号 </view>
						<view class="login-form-item-input">
							<input type="text" placeholder="请输入账号" v-model="account" />
						</view>
					</view>
					<view class="login-form-item">
						<view class="login-form-item-label"> 密码 </view>
						<view class="login-form-item-input">
							<input
								password
								type="password"
								placeholder="请输入密码"
								v-model="password"
							/>
						</view>
					</view>
					<view class="login-form-item btn-wrapper">
						<view class="login-btn" @click="login"> 登录 </view>
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
	import { loginByPwd } from "@/api/auth";
	import { useUserStore } from "@/stores/user";
	import { encryptPassword } from "@/utils/crypto";

	const role = ref(0);

	const account = ref("");
	const password = ref("");

	onLoad((options) => {
		if (options) {
			const data = parseData(options.data);
			console.log("roleId:", data.role);
			role.value = Number(data.role);
		}
	});

	const login = () => {
		console.log(
			"账号:",
			account.value,
			"\n密码:",
			encryptPassword(password.value),
		);
		loginByPwd({
			role: role.value,
			account: account.value,
			password: encryptPassword(password.value),
		})
			.then((res) => {
				console.log("登录响应:", res);
				// 缓存 token
				// res 现在就是你后端 data 里的内容
				uni.setStorageSync("token", res.data.token);
				console.log("Token 已缓存");
				// 缓存用户信息
				const userStore = useUserStore();
				userStore.setUserInfo(res.data.user);
				if (res.code === 200) {
					jump("/pages/main/index/index", role.value, "relaunch");
				}
			})
			.catch((err) => {
				console.error("登录失败:", err);
			});
	};
</script>

<style scoped lang="scss" src="./index.scss"></style>
