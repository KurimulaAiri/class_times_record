<template>
	<view class="container">
		<FormPage :groups="groups" :model-value="record"></FormPage>
	</view>
</template>

<script setup lang="ts">
	import { ref } from "vue";
	import FormPage from "@/components/form-page/index.vue";
	import { usePageData } from "@/utils/common";

	usePageData((res) => {
		console.log("接收到：", res);
		record.value = res;
	});

	const record = ref<RecordResponse>({} as RecordResponse);

	const recordTypeMap = {
		2: "扣课",
		1: "增课",
	};

	const groups = ref<FormGroupConfig[]>([
		{
			title: "扣课记录",
			mode: "display",
			items: [
				{
					label: "学生姓名",
					key: "student.studentName",
					type: "input",
				},
				{
					label: "扣课课程",
					key: "course.courseName",
					type: "input",
				},
				{
					label: "课时变动类型",
					key: "recordType",
					type: "input",
					format: (val) => recordTypeMap[val] || "-",
				},
				{
					label: "课时变动",
					key: "recordChange",
					type: "input",
				},
				{
					label: "扣课备注",
					key: "recordRemark",
					type: "input",
				},
				{
					label: "扣课日期",
					key: "recordTimeStr",
					type: "input",
				},
				{
					label: "操作时间",
					key: "createTimeStr",
					type: "input",
				},
			],
		},
	]);
</script>

<style scoped lang="scss" src="./index.scss"></style>
