<template>
	<FormPage :groups="groups" v-model:modelValue="form"></FormPage>
	<PageFooter
		:buttons="[{ text: '保存课程信息', type: 'primary' }]"
		@btnClick="submitForm"
	></PageFooter>
</template>

<script setup lang="ts">
	import { ref } from "vue";
	import { useUserStore } from "@/stores/user";
	import { insertCourse } from "@/api/course";
	import { jump, showToast } from "@/utils/common/index";
	import FormPage from "@/components/form-page/index.vue";
	import PageFooter from "@/components/page-footer/index.vue";

	const userStore = useUserStore();

	/** 课程表单数据 */
	const form = ref<CourseResponse>({
		id: 0,
		courseType: 1,
		isAvailable: true,
		institution: {
			id: 0,
			institutionName: "",
			institutionAddress: "",
			status: 0,
			createTimeStr: "",
			updateTimeStr: "",
		},
		courseName: "",
	});

	const groups: FormGroupConfig[] = [
		{
			title: "课程信息",
			mode: "edit",
			titleStyle: "theme",
			items: [
				{
					label: "课程名称",
					key: "courseName",
					type: "input",
					placeholder: "请输入课程名称",
					required: true,
				},
				{
					label: "课程扣费类型",
					key: "courseType",
					type: "radio",
					placeholder: "请选择课程类型",
					options: [
						{ label: "按次", value: 1 },
						{ label: "按天", value: 2 },
					],
				},
			],
		},
	];

	/** 提交创建课程表单 */
	const submitForm = async () => {
		if (!form.value.courseName) {
			showToast("请输入课程名称");
			return;
		}

		try {
			const res = await insertCourse({
				courseName: form.value.courseName,
				courseType: form.value.courseType,
				isAvailable: form.value.isAvailable,
				institutionId:
					userStore.userInfo?.roleId === 4
						? userStore.userInfo.identityInfo.institutionId
						: 0,
			});
			if (res.courseId !== 0) {
				setTimeout(() => {
					uni.navigateBack();
				}, 1000);
				showToast("信息保存成功", "success");
			} else {
				showToast("信息保存失败", "error");
			}
		} catch (error) {
			showToast("信息保存失败", "error");
		}
	};
</script>

<style scoped lang="scss" src="./index.scss"></style>
