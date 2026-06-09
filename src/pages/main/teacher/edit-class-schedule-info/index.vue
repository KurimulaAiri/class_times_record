<template>
	<FormPage :groups="groups" v-model:model-value="currentSchedule"> </FormPage>
	<PageFooter :buttons="buttons" @btn-click="handleClick" />
</template>

<script setup lang="ts">
	import { ref, computed } from "vue";
	import FormPage from "@/components/form-page/index.vue";
	import PageFooter from "@/components/page-footer/index.vue";
	import { showToast, usePageData } from "@/utils/common";
	import { updateClassScheduleById } from "@/api/class-schedule";

	const refreshEventFunctionName = ref<string>("");

	const buttons = ref<FooterButton[]>([
		{
			text: "保存",
			type: "primary",
		},
	]);

	const handleClick = async (index: number) => {
		if (index === 0) {
			// 处理保存逻辑
			console.log("保存", currentSchedule.value);
			const res = await updateClassScheduleById({
				id: currentSchedule.value.id,
				dayOfWeek: currentSchedule.value.dayOfWeek,
				remark: currentSchedule.value.remark,
				startDate: currentSchedule.value.startDateStr,
				endDate: currentSchedule.value.endDateStr,
				startTime: currentSchedule.value.startTimeStr,
				endTime: currentSchedule.value.endTimeStr,
			});
			if (res.classSchedules.length > 0) {
				showToast({
					msg: "更新成功",
					icon: "success",
					callback: () => {
						uni.$emit(refreshEventFunctionName.value);
						uni.navigateBack();
					},
				});
			}
		}
	};

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
					type: "select",
					placeholder: "请选择",
					options: [
						{ label: "周一", value: 1 },
						{ label: "周二", value: 2 },
						{ label: "周三", value: 3 },
						{ label: "周四", value: 4 },
						{ label: "周五", value: 5 },
						{ label: "周六", value: 6 },
						{ label: "周日", value: 7 },
					],
				},
				{
					label: "备注",
					key: "remark",
					inputAlign: "right",
					type: "input",
					emptyText: "未填写",
				},
			],
		},
	]);

	const currentSchedule = ref<ClassScheduleResponse>(
		{} as ClassScheduleResponse,
	);

	usePageData<EditClassScheduleInfoPageTransfer>((res) => {
		refreshEventFunctionName.value = res.refreshEventFunctionName;
		currentSchedule.value = res.data.timeSlots[0];
	});
</script>

<style scoped></style>
