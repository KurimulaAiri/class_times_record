<template>
	<view class="container">
		<FormPage :groups="groups" v-model:modelValue="form"></FormPage>

		<PageFooter
			:buttons="[{ text: '添加教师', type: 'primary' }]"
			@btnClick="submitForm"
		></PageFooter>
	</view>
</template>

<script setup lang="ts">
	import { ref } from "vue";
	import { insertTeacher } from "@/api/teacher";
	import { showToast } from "@/utils/common";
	import { useUserStore } from "@/stores/user";
	import { encryptPassword } from "@/utils/crypto";
	import FormPage from "@/components/form-page/index.vue";
	import PageFooter from "@/components/page-footer/index.vue";

	const userStore = useUserStore();

	const institutionId =
		userStore.userInfo?.roleId === 4
			? userStore.userInfo?.identityInfo.institutionId
			: 0;

	const form = ref<Record<string, any>>({
		username: "",
		account: "",
		password: "",
		confirmPassword: "",
		institutionId: institutionId || 0,
	});

	const groups: FormGroupConfig[] = [
		{
			title: "教师信息",
			titleStyle: "theme",
			mode: "edit",
			items: [
				{
					key: "username",
					label: "教师姓名",
					type: "input",
					required: true,
					placeholder: "请输入教师姓名",
				},
				{
					key: "account",
					label: "登录账号",
					type: "input",
					required: true,
					placeholder: "请输入登录账号",
				},
				{
					key: "password",
					label: "登录密码",
					type: "input",
					required: true,
					placeholder: "请输入密码",
					inputType: "password",
				},
				{
					key: "confirmPassword",
					label: "确认密码",
					type: "input",
					required: true,
					placeholder: "请再次输入密码",
					inputType: "password",
				},
			],
		},
	];

	const validateForm = () => {
		if (!form.value.username.trim()) {
			showToast({ msg: "教师姓名不能为空" });
			return false;
		}
		if (!form.value.account.trim()) {
			showToast({ msg: "登录账号不能为空" });
			return false;
		}
		if (!form.value.password) {
			showToast({ msg: "密码不能为空" });
			return false;
		}
		if (form.value.password !== form.value.confirmPassword) {
			showToast({ msg: "两次密码输入不一致" });
			return false;
		}
		return true;
	};

	/** 提交添加教师表单 */
	const submitForm = async () => {
		if (!validateForm()) {
			return;
		}
		try {
			const teacherId = await insertTeacher({
				username: form.value.username,
				account: form.value.account,
				password: encryptPassword(form.value.password),
				institutionId: form.value.institutionId,
			});
			if (teacherId) {
				showToast({ msg: "添加成功", icon: "success" });
				uni.$emit("needRefreshTeacher");
				setTimeout(() => uni.navigateBack(), 1500);
			}
		} catch (error) {
			showToast({ msg: "添加失败" });
		}
	};
</script>

<style scoped lang="scss" src="./index.scss"></style>
