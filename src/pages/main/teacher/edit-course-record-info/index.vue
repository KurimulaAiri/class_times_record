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

	const originalExpireTime = ref<string>("");

	usePageData<CourseRecordResponse>(async (courseRecordInput) => {
		// 截取日期部分（去掉时分秒），确保 date picker 正确显示
		courseRecordInput.expireTimeStr = courseRecordInput.expireTimeStr?.split(" ")[0] || "";
		courseRecordModel.value = {
			courseRecord: courseRecordInput,
			course: courseRecordInput.course,
		};
		originalExpireTime.value = courseRecordInput.expireTimeStr;
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
				{
					label: `到期时间`,
					key: "courseRecord.expireTimeStr",
					inputAlign: "right",
					type: "date",
				},
			],
		},
	]);

	const validate = () => {
		// 校验到期时间是否与原始到期时间相同
		if (courseRecordModel.value.courseRecord.expireTimeStr === originalExpireTime.value) {
			showToast({ msg: "到期时间不能与原始到期时间相同" });
			return false;
		}

		if (
			courseRecordModel.value.courseRecord.courseTotalTime <
			courseRecordModel.value.courseRecord.courseRestTime
		) {
			showToast("剩余课时不能大于总课时");
			return false;
		}
		return true;
	};

	const submit = async () => {
		if (!validate()) {
			return;
		}

		console.log("submit", courseRecordModel.value);
		const res = await updateCourseRecordById({
			id: courseRecordModel.value.courseRecord.id,
			courseRestTime: courseRecordModel.value.courseRecord.courseRestTime,
			courseTotalTime: courseRecordModel.value.courseRecord.courseTotalTime,
			expireTime: courseRecordModel.value.courseRecord.expireTimeStr + " 00:00:00",
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
