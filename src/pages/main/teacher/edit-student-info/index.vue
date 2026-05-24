<template>
	<view class="container">
		<FormPage :groups="groups" v-model:modelValue="form">
			<template #group-1>
				<view
					v-if="!form.primaryParent || !form.primaryParent.parentId"
					class="add-placeholder"
					@tap="initParent('primary')"
				>
					<text class="plus-icon">+</text>
					<text>添加主要联系人</text>
				</view>
			</template>
			<template #group-2>
				<view
					v-if="!form.secondaryParent || !form.secondaryParent.parentId"
					class="add-placeholder"
					@tap="initParent('secondary')"
				>
					<text class="plus-icon">+</text>
					<text>添加备用联系人</text>
				</view>
			</template>
		</FormPage>

		<view class="footer">
			<button class="submit-btn" @tap="submitForm">保存修改</button>
		</view>
	</view>
</template>

<script setup lang="ts">
	import { ref, computed } from "vue";
	import { onLoad } from "@dcloudio/uni-app";
	import { useStudentStore } from "@/stores/student";
	import { updateStudent } from "@/api/student";
	import FormPage from "@/components/form-page/index.vue";

	const studentStore = useStudentStore();

	const genders = [
		{ name: "男", value: 1 },
		{ name: "女", value: 0 },
	];

	// 默认空表单骨架
	const createEmptyForm = (): StudentResponse => ({
		id: 0,
		avatar: "",
		studentName: "",
		sex: -1,
		relation: "",
		birthStr: "",
		school: "",
		address: "",
		institutions: [],
		primaryParent: {
			isPrimary: true,
			username: "",
			studentId: 0,
			parentId: 0,
			relation: "",
			phone: "",
		}, // 💡 初始化为空对象，配合 template 中的展示
		secondaryParent: {
			isPrimary: false,
			username: "",
			studentId: 0,
			parentId: 0,
			relation: "",
			phone: "",
		},
		courseRestTime: 0,
		courseTotalTime: 0,
		createTimeStr: "",
		updateTimeStr: "",
	});

	const form = ref<StudentResponse>(createEmptyForm());

	// 💡 核心修复：配置项 items 不要使用条件动态销毁！
	// 让输入配置永久驻留，控制面板的开启关闭由模板插槽里的 `add-placeholder` 来决定
	const groups = computed<FormGroupConfig[]>(() => [
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
					key: "birthStr",
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
			// 💡 只有当有数据实体时，才下发 items 配置项渲染输入框
			items: form.value.primaryParent
				? [
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
					]
				: [],
		},
		{
			title: "备用联系人 (可选)",
			titleStyle: "theme",
			mode: "edit",
			items: form.value.secondaryParent
				? [
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
					]
				: [],
		},
	]);

	onLoad(() => {
		fetchStudentDetail();
	});

	const fetchStudentDetail = async () => {
		if (!studentStore.studentInfo) return;
		uni.showLoading({ title: "加载中..." });
		try {
			// 从 pinia 深度克隆数据
			const res = JSON.parse(JSON.stringify(studentStore.studentInfo));

			// 💡 核心修复：直接大对象赋值，全量触发 Vue 的响应式追踪与 computed 重新计算
			form.value = res;

			console.log("回显后的数据：", form.value);
		} catch (error) {
			console.error("获取详情失败", error);
		} finally {
			uni.hideLoading();
		}
	};

	const initParent = (type: "primary" | "secondary") => {
		// 创建一个全新的 Parent 结构，临时给一个非零的占位 id 撑开组件的检测限制
		const emptyParent: ParentResponse = {
			studentId: form.value.id,
			parentId: -1, // 💡 用 -1 标记为新创建但未持久化的联系人节点
			username: "",
			relation: "",
			phone: "",
			isPrimary: false,
		};

		if (type === "primary") {
			emptyParent.isPrimary = true;
			form.value.primaryParent = emptyParent;
		} else {
			if (!form.value.primaryParent) {
				return uni.showToast({ title: "请先添加主要联系人", icon: "none" });
			}
			emptyParent.isPrimary = false;
			form.value.secondaryParent = emptyParent;
		}
	};

	const submitForm = async () => {
		if (!form.value.studentName)
			return uni.showToast({ title: "姓名不能为空", icon: "none" });

		if (form.value.primaryParent) {
			if (
				!form.value.primaryParent.username ||
				!form.value.primaryParent.phone ||
				!form.value.primaryParent.relation
			) {
				return uni.showToast({ title: "请完善主要联系人信息", icon: "none" });
			}
		}

		let hasSecondary = false;
		if (form.value.secondaryParent) {
			const sp = form.value.secondaryParent;
			// 判断是否填写了备用联系人
			hasSecondary = Boolean(sp.username || sp.phone || sp.relation);
			const isComplete = Boolean(sp.username && sp.phone && sp.relation);
			if (hasSecondary && !isComplete) {
				return uni.showToast({ title: "请完善备用联系人信息", icon: "none" });
			}
		}

		const submitData: UpdateStudentRequest = { ...form.value };

		// 如果全新添加联系人时刚才用了临时 -1，提交给后端前清洗重置回 0
		if (submitData.primaryParent && submitData.primaryParent.parentId === -1) {
			submitData.primaryParent.parentId = 0;
		}
		if (submitData.secondaryParent) {
			if (submitData.secondaryParent.parentId === -1) {
				submitData.secondaryParent.parentId = 0;
			}
			if (!hasSecondary) {
				submitData.secondaryParent = null;
			}
		}

		try {
			uni.showLoading({ title: "保存中..." });
			await updateStudent(submitData);
			uni.showToast({ title: "修改成功", icon: "success" });
			setTimeout(() => {
				uni.navigateBack();
				uni.$emit("needRefresh");
			}, 1500);
		} catch (error) {
			console.error(error);
		}
	};
</script>

<style scoped lang="scss" src="./index.scss"></style>
