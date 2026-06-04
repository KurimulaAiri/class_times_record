<template>
	<FormPage :groups="groups" :modelValue="form"></FormPage>
	<PageFooter :buttons="buttons" @btnClick="toEditCourse"></PageFooter>
</template>

<script setup lang="ts">
	import { ref } from "vue";
	import { jump, usePageData } from "@/utils/common";
	import FormPage from "@/components/form-page/index.vue";
	import PageFooter from "@/components/page-footer/index.vue";
	import { ROUTES } from "@/config/routes";

	const buttons = ref<FooterButton[]>([
		{
			text: "编辑",
			type: "primary",
		},
	]);

	/** 课程类型映射表 */
	const courseTypeMap: Record<number, string> = {
		1: "按次",
		2: "按天",
	};

	const groups = ref<FormGroupConfig[]>([
		{
			title: "课程详情",
			mode: "display",
			items: [
				{
					label: "课程名称",
					key: "courseName",
					type: "text",
				},
				{
					label: "课程类型",
					key: "courseType",
					type: "text",
					format: (value) => courseTypeMap[value] || "未知类型",
				},
			],
		},
	]);

	/** 课程表单数据 */
	const form = ref<CourseResponse>({
		id: 0,
		courseName: "",
		courseType: 0,
		isAvailable: false,
		institution: {} as InstitutionResponse,
		currentStudentCourseRecord: {} as CourseRecordResponse,
	});

	usePageData<CourseResponse>((rawCourse) => {
		form.value = rawCourse;
	});

	const toEditCourse = () => {
		jump(ROUTES.EDIT_COURSE_INFO);
	};
</script>

<style scoped lang="scss" src="./index.scss"></style>
