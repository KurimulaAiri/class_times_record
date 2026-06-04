<template>
	<FormPage :groups="groups" v-model:model-value="courseRecordModel"></FormPage>
	<PageFooter :buttons="buttons" @btn-click="submit"></PageFooter>
</template>

<script setup lang="ts">
	import FormPage from "@/components/form-page/index.vue";
	import PageFooter from "@/components/page-footer/index.vue";
	import { updateCourseRecordById } from "@/api/course-record";
	import { ref, computed } from "vue";
	import { showToast, usePageData } from "@/utils/common";

	const buttons = computed<FooterButton[]>(() => [
		{ text: "保存修改", type: "primary" },
	]);

	const courseRecordModel = ref<MixCourseRecordResponse>(
		{} as MixCourseRecordResponse,
	);

	usePageData<CourseRecordResponse>(async (courseRecordInput) => {
		courseRecordModel.value = {
			courseRecord: courseRecordInput,
			course: courseRecordInput.course,
		};
		console.log("courseRecordModel.value", courseRecordModel.value);
	});

	const groups = computed<FormGroupConfig[]>(() => [
		{
			title: "课程信息",
			mode: "display",
			items: [
				{
					label: `课程名称`,
					key: "course.courseName",
					type: "text",
				},
			],
		},
		{
			title: "调整课时",
			mode: "edit",
			items: [
				{
					label: `总课时`,
					key: "courseRecord.courseTotalTime",
					inputAlign: "right",
					type: "number",
				},
				{
					label: `剩余课时`,
					key: "courseRecord.courseRestTime",
					inputAlign: "right",
					type: "number",
				},
			],
		},
	]);

	const validate = computed(() => {
		if (
			courseRecordModel.value.courseRecord.courseTotalTime <
			courseRecordModel.value.courseRecord.courseRestTime
		) {
			showToast("剩余课时不能大于总课时");
			return false;
		}
		return true;
	});

	const submit = async () => {
		if (!validate.value) {
			return;
		}

		console.log("submit", courseRecordModel.value);
		const res = await updateCourseRecordById({
			id: courseRecordModel.value.courseRecord.id,
			courseRestTime: courseRecordModel.value.courseRecord.courseRestTime,
			courseTotalTime: courseRecordModel.value.courseRecord.courseTotalTime,
		});
		if (res === 1) {
			showToast({
				msg: "修改成功",
				icon: "success",
				callback: () => {
					uni.navigateBack();
					uni.$emit("needRefresh");
				},
			});
		} else {
			showToast({ msg: "修改失败", icon: "error" });
		}
	};
</script>

<style scoped lang="scss" src="./index.scss"></style>
