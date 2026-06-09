<template>
	<view class="container">
		<FormPage :groups="groups" v-model:modelValue="form"></FormPage>

		<PageFooter
			:buttons="[{ text: '保存修改', type: 'primary' }]"
			@btnClick="submitForm"
		></PageFooter>
	</view>
</template>

<script setup lang="ts">
	import { ref } from "vue";
	import { updateCourse } from "@/api/course";
	import { showToast, usePageData } from "@/utils/common";
	import FormPage from "@/components/form-page/index.vue";
	import PageFooter from "@/components/page-footer/index.vue";

	/** 课程类型选项 */
	const courseTypeOptions = [
		{ label: "按次", value: 1 },
		{ label: "按天", value: 2 },
	];

	/** 是否可用选项 */
	const availableOptions = [
		{ label: "启用", value: true },
		{ label: "停用", value: false },
	];

	/** 表单数据 */
	const form = ref<Record<string, any>>({});

	/** 表单分组配置 */
	const groups = ref<FormGroupConfig[]>([
		{
			title: "课程信息",
			titleStyle: "theme",
			mode: "edit",
			items: [
				{
					label: "课程名称",
					key: "courseName",
					type: "input",
					required: true,
					placeholder: "请输入课程名称",
				},
				{
					label: "课程扣费类型",
					key: "courseType",
					type: "radio",
					options: courseTypeOptions,
				},
				{
					label: "课程状态",
					key: "isAvailable",
					type: "radio",
					options: availableOptions,
				},
			],
		},
	]);

	/** 从上一页接收课程数据 */
	usePageData<CourseResponse>((course) => {
		form.value = {
			id: course.id,
			courseName: course.courseName,
			courseType: course.courseType,
			isAvailable: course.isAvailable,
		};
	});

	/** 提交修改 */
	const submitForm = async () => {
		if (!form.value.courseName?.trim()) {
			return showToast({ msg: "课程名称不能为空" });
		}

		try {
			const effect = await updateCourse({
				courseId: form.value.id,
				courseName: form.value.courseName.trim(),
				courseType: form.value.courseType,
				isAvailable: form.value.isAvailable,
			});
			if (effect > 0) {
				showToast({ msg: "修改成功", icon: "success" });
				uni.$emit("needRefreshCourse");
				setTimeout(() => uni.navigateBack(), 1500);
			}
		} catch (error) {
			showToast({ msg: "修改失败" });
		}
	};
</script>

<style scoped lang="scss" src="./index.scss"></style>
