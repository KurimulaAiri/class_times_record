<template>
	<view class="content">
		<view class="login-form">
			<view class="login-form-title">
				{{ role === 4 ? "教师" : "家长" }}登录
			</view>

			<view class="login-form-content">
				<!-- 账号项 -->
				<view class="login-form-item">
					<view class="login-form-item-label">账号</view>
					<view class="login-form-item-input">
						<input
							type="text"
							placeholder="请输入手机号/账号"
							placeholder-class="input-placeholder"
							v-model="account"
						/>
					</view>
				</view>

				<!-- 密码项 -->
				<view class="login-form-item">
					<view class="login-form-item-label">密码</view>
					<view class="login-form-item-input">
						<input
							password
							type="password"
							placeholder="请输入密码"
							placeholder-class="input-placeholder"
							v-model="password"
						/>
					</view>
				</view>

				<!-- 隐私条款 -->
				<view class="privacy-wrapper">
					<checkbox-group @change="handleCheckboxChange">
						<label class="privacy-label">
							<checkbox
								:checked="isAgree"
								color="#70a9a2"
								style="transform: scale(0.7)"
							/>
							<text class="privacy-text">我已阅读并同意</text>
						</label>
					</checkbox-group>
					<text class="privacy-link" @click="openAgreement"
						>《用户服务协议》</text
					>
					<text class="privacy-text">及</text>
					<text class="privacy-link" @click="openPrivacy">《隐私政策》</text>
				</view>

				<!-- 登录按钮 -->
				<view class="btn-wrapper">
					<view class="login-btn" hover-class="none" @click="login">
						立即登录
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script setup lang="ts">
	import { onLoad } from "@dcloudio/uni-app";
	import { ref } from "vue";
	import { jump, parseData, showToast } from "@/utils/common";
	import { ROUTES } from "@/config/routes";
	import { loginByPwd } from "@/api/auth";
	import { useUserStore } from "@/stores/user";
	import { encryptPassword } from "@/utils/crypto";

	const role = ref(0);

	const account = ref("");
	const password = ref("");

	/** 是否同意用户协议 */
	const isAgree = ref(false);

	/** 打开隐私政策页面 */
	const openPrivacy = () => {
		// 假设你的路由配置里有这个页面，或者直接用 jump
		jump(ROUTES.PRIVACY);
	};

	/** 打开用户协议页面 */
	const openAgreement = () => {
		jump(ROUTES.USER_AGREEMENT); // 确保在 ROUTES 中配置了此常量
	};

	// 新增：处理勾选变化
	const handleCheckboxChange = (e: any) => {
		isAgree.value = e.detail.value.length > 0;
	};

	onLoad((options) => {
		if (options) {
			const data: any = parseData(options.data);
			console.log("roleId:", data.role);
			role.value = Number(data.role);
		}
	});

	/** 执行登录操作 */
	const login = () => {
		// 新增：登录前校验是否同意条款
		if (!isAgree.value) {
			showToast("请先阅读并同意隐私条款");
			return;
		}

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
				uni.setStorageSync("accessToken", res.data.accessToken);
				uni.setStorageSync("refreshToken", res.data.refreshToken);
				console.log("Token 已缓存");
				const userStore = useUserStore();
				userStore.setUserInfo(res.data.user);
				if (res.code === 200) {
					jump(ROUTES.MAIN_INDEX, role.value, "relaunch");
				}
			})
			.catch((err) => {
				console.error("登录失败:", err);
			});
	};
</script>

<style scoped lang="scss" src="./index.scss"></style>
