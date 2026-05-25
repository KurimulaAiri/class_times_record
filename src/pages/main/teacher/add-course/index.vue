<template>
	<FormPage :groups="groups" :modelValue="form"></FormPage>
</template>

<script setup lang="ts">
	import { ref } from "vue";
	import FormPage from "@/components/form-page/index.vue";

	const form = ref<CourseResponse>({
		id: 0,
		courseType: 0,
		available: false,
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
			],
		},
	];
</script>

<style scoped lang="scss" src="./index.scss"></style>
