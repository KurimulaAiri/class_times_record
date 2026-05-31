<template>
	<FormPage :groups="groups" v-model:model-value="currentSchedule"> </FormPage>
</template>

<script setup lang="ts">
	import { ref, computed } from "vue";
	import FormPage from "@/components/form-page/index.vue";
	import { usePageData } from "@/utils/common";

	const groups = computed<FormGroupConfig[]>(() => [
		{
			title: "班级信息",
			mode: "edit",
			items: [
				{
					label: "起始日期",
					key: "startDateStr",
					inputAlign: "right",
					type: "date",
				},
				{
					label: "结束日期",
					key: "endDateStr",
					inputAlign: "right",
					type: "date",
				},
				{
					label: "起始时间",
					key: "startTimeStr",
					inputAlign: "right",
					type: "time",
				},
				{
					label: "结束时间",
					key: "endTimeStr",
					inputAlign: "right",
					type: "time",
				},
				{
					label: "上课日",
					key: "dayOfWeek",
					inputAlign: "right",
					type: "number",
				},
			],
		},
	]);

	const currentSchedule = ref<ClassScheduleResponse>(
		{} as ClassScheduleResponse,
	);

	usePageData<PeriodItem>((res) => {
		currentSchedule.value = res.timeSlots[0];
	});
</script>

<style scoped></style>
