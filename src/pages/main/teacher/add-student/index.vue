<template>
	<view class="container">
		<FormPage :groups="groups" v-model:modelValue="form"></FormPage>

		<view class="footer">
			<button class="submit-btn" @tap="submitForm">保存学生信息</button>
		</view>
	</view>
</template>

<script setup lang="ts">
	import { ref } from "vue";
	import { insertStudent } from "@/api/student";
	import { useUserStore } from "@/stores/user";
	import FormPage from "@/components/form-page/index.vue";

	const userStore = useUserStore();

	const currentTeacher =
		userStore.userInfo?.roleId === 4 ? userStore.userInfo?.identityInfo : null;

	const genders = [
		{ name: "男", value: 1 },
		{ name: "女", value: 0 },
	];

	// 💡 2. 将 reactive 改为 ref
	const form = ref<InsertStudentRequest>({
		studentName: "",
		institutionId: currentTeacher?.institutionId || 0,
		sex: 1,
		birth: "",
		school: "",
		address: "",
		primaryParent: {
			studentId: 0,
			parentId: 0,
			username: "",
			relation: "",
			phone: "",
			isPrimary: true,
		},
		secondaryParent: {
			studentId: 0,
			parentId: 0,
			username: "",
			relation: "",
			phone: "",
			isPrimary: false,
		},
	});

	const groups: FormGroupConfig[] = [
		{
			title: "基础信息",
			titleStyle: "theme",
			mode: "edit",
			items: [
				{
					key: "studentName",
					label: "学生姓名",
					type: "input",
					required: true,
					placeholder: "请输入姓名",
				},
				{ key: "sex", label: "性别", type: "radio", options: genders },
				{
					key: "birth",
					label: "出生日期",
					type: "date",
					placeholder: "请选择日期",
				},
				{
					key: "school",
					label: "在读学校",
					type: "input",
					placeholder: "请输入学校名称",
				},
				{
					key: "address",
					label: "家庭住址",
					type: "textarea",
					placeholder: "请输入详细地址",
					noBorder: true,
				},
			],
		},
		{
			title: "主要联系人",
			titleStyle: "theme",
			mode: "edit",
			items: [
				{
					key: "primaryParent.username",
					label: "家长姓名",
					type: "input",
					required: true,
					placeholder: "请输入家长姓名",
				},
				{
					key: "primaryParent.relation",
					label: "关系",
					type: "input",
					required: true,
					placeholder: "如：爸爸、妈妈",
				},
				{
					key: "primaryParent.phone",
					label: "联系电话",
					type: "number",
					required: true,
					placeholder: "请输入手机号",
					noBorder: true,
					maxlength: 11,
				},
			],
		},
		{
			title: "备用联系人 (可选)",
			titleStyle: "theme",
			mode: "edit",
			items: [
				{
					key: "secondaryParent.username",
					label: "家长姓名",
					type: "input",
					placeholder: "请输入家长姓名",
				},
				{
					key: "secondaryParent.relation",
					label: "关系",
					type: "input",
					placeholder: "如：爷爷、奶奶",
				},
				{
					key: "secondaryParent.phone",
					label: "联系电话",
					type: "number",
					placeholder: "请输入手机号",
					noBorder: true,
					maxlength: 11,
				},
			],
		},
	];

	const submitForm = async () => {
		// 💡 所有表单校验记得加上 .value
		if (!form.value.studentName)
			return uni.showToast({ title: "姓名不能为空", icon: "none" });
		if (
			!form.value.primaryParent.username ||
			!form.value.primaryParent.phone ||
			!form.value.primaryParent.relation
		) {
			return uni.showToast({ title: "请完善主要联系人信息", icon: "none" });
		}

		const sp = form.value.secondaryParent;
		const hasAny = Boolean(sp.username || sp.phone || sp.relation);
		const isComplete = Boolean(sp.username && sp.phone && sp.relation);

		if (hasAny && !isComplete) {
			return uni.showToast({ title: "请完善备用联系人信息", icon: "none" });
		}

		// 💡 修复点：必须解构 form.value 才能拿到干净的表单后端数据对象
		const submitData: any = { ...form.value };

		if (!hasAny) {
			submitData.secondaryParent = null;
		}

		console.log("最终提交数据：", submitData);

		try {
			// 💡 确保传入的是干净的 submitData 对象
			const studentId = await insertStudent(submitData);
			console.log("插入学生ID:", studentId);
			if (studentId) {
				uni.showToast({ title: "添加成功", icon: "success" });
				setTimeout(() => uni.navigateBack(), 1500);
			}
		} catch (error) {}
	};
</script>

<style scoped lang="scss" src="./index.scss"></style>
