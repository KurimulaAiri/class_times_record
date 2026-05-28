<template>
	<view>
		<FormPage
			:groups="groups"
			@picker-tap="onPickerTap"
			v-model:model-value="insertForm"
		>
		</FormPage>

		<PageFooter
			:buttons="[{ text: '添加课程', type: 'primary' }]"
			@btnClick="handleSubmit"
		></PageFooter>
	</view>
</template>

<script setup lang="ts">
	import FormPage from "@/components/form-page/index.vue";
	import PageFooter from "@/components/page-footer/index.vue";
	import { useStudentStore } from "@/stores/student";
	import { ROUTES } from "@/config/routes";
	import { jump, showToast } from "@/utils/common";
	import { onLoad } from "@dcloudio/uni-app";
	import { onUnmounted, ref, computed, watch } from "vue";
	import { insertCourseRecord } from "@/api/course-record";

	const studentStore = useStudentStore();
	const currentStudent = ref<StudentResponse>();

	const courseName = ref("请选择");

	const selectedCourse = ref<CourseResponse>({
		id: 0,
		courseName: "",
		courseType: 0,
		isAvailable: false,
		institution: {} as InstitutionResponse,
	});

	const insertForm = ref<InsertCourseRecordRequest>({
		courseId: 0,
		studentId: currentStudent.value?.id || 0,
		courseRemark: "",
		courseRestTime: 0,
		courseTotalTime: 0,
	});

	// 2. 🌟 核心：监听 Pinia Store 中学生数据的真正到达
	watch(
		() => studentStore?.studentInfo,
		(newInfo) => {
			if (newInfo && newInfo.id) {
				currentStudent.value = newInfo;
				insertForm.value.studentId = newInfo.id; // ✅ 成功捕获并赋值真实的 Student ID
				console.log("学生ID已成功绑定到表单:", insertForm.value.studentId);
			}
		},
		{ immediate: true, deep: true }, // 立即执行一次，防止 Store 内部原本就有持久化值
	);

	const groups = computed<FormGroupConfig[]>(() => [
		{
			title: "添加课程信息",
			mode: "edit",
			items: [
				{
					label: "选择课程",
					key: "courseId",
					type: "picker",
					inputAlign: "right",
					pickerText: courseName.value,
				},
				{
					label: "剩余课时",
					key: "courseRestTime",
					type: "stepper",
					inputAlign: "right",
					placeholder: "请输入剩余课时",
				},
				{
					label: "总课时",
					key: "courseTotalTime",
					type: "stepper",
					inputAlign: "right",
					placeholder: "请输入总课时",
				},
			],
		},
	]);

	uni.$on("updateCourse", (course: CourseResponse) => {
		console.log("接收课程:", course);
		selectedCourse.value = course;

		courseName.value = course.courseName;
		insertForm.value.courseId = course.id;
	});

	onLoad(() => {
		// 1. 获取当前学生信息
		const student = studentStore?.studentInfo || ({} as StudentResponse);
		currentStudent.value = student;

		// 2. ✅ 在这里显式补全表单中缺失的学生 ID
		if (student && student.id) {
			insertForm.value.studentId = student.id;
			console.log("onLoad 阶段成功注入学生ID:", insertForm.value.studentId);
		} else {
			console.warn("警告：未能在 Store 中检测到有效的学生登录信息！");
		}
	});

	/** 处理课程选择器点击事件 */
	const onPickerTap = () => {
		jump(ROUTES.SELECT_COURSE);
	};

	const validate = () => {
		// 🌟 新增：拦截未就绪的学生ID，防止误触或非法提交
		if (!insertForm.value.studentId || insertForm.value.studentId <= 0) {
			uni.showToast({
				title: "当前学生身份未就绪，请返回重试",
				icon: "none",
			});
			return false;
		}

		if (insertForm.value.courseId === 0) {
			uni.showToast({
				title: "请选择课程",
				icon: "none",
			});
			return false;
		}

		if (insertForm.value.courseRestTime <= 0) {
			uni.showToast({
				title: "请输入正确的剩余课时，剩余课时不能小于等于0",
				icon: "none",
			});
			return false;
		}

		if (insertForm.value.courseTotalTime <= 0) {
			uni.showToast({
				title: "请输入正确的总课时，总课时不能小于等于0",
				icon: "none",
			});
			return false;
		}

		if (insertForm.value.courseRestTime > insertForm.value.courseTotalTime) {
			uni.showToast({
				title: "剩余课时不能大于总课时",
				icon: "none",
			});
			return false;
		}

		return true;
	};

	/** 处理提交事件 */
	const handleSubmit = async () => {
		if (!validate()) {
			return;
		}
		console.log("提交表单:", insertForm.value);
		const res = await insertCourseRecord(insertForm.value);

		if (res) {
			showToast("添加成功", "success");
			uni.navigateBack();
		} else {
			showToast("添加失败", "none");
		}
	};

	onUnmounted(() => {
		uni.$off("updateCourse");
	});
</script>

<style scoped lang="scss" src="./index.scss"></style>
