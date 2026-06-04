<template>
	<view class="container">
		<!-- 互斥切换模式按钮 -->
		<view class="mode-tab-box">
			<view
				class="tab-slider"
				:class="{ 'slide-right': deductMode === 'course' }"
			></view>
			<view
				class="tab-item"
				:class="{ active: deductMode === 'student' }"
				@tap="switchMode('student')"
			>
				按学员扣课
			</view>
			<view
				class="tab-item"
				:class="{ active: deductMode === 'course' }"
				@tap="switchMode('course')"
			>
				按课程扣课
			</view>
		</view>

		<!-- 业务动态渲染区 -->
		<!-- 使用 v-show 可以在切换时保留彼此选中的临时状态；若希望完全销毁重置，可换成 v-if -->
		<view v-show="deductMode === 'student'">
			<DeductByStudent @updateData="handleStudentDataUpdate" />
		</view>

		<view v-show="deductMode === 'course'">
			<DeductByCourse @updateData="handleCourseDataUpdate" />
		</view>

		<!-- 公共备注展示区 -->
		<view class="section-title">其他信息</view>
		<view class="section remark-section">
			<view class="date-picker-row">
				<view class="label">扣课日期</view>
				<picker mode="date" :value="deductDate" @change="handleDateChange">
					<view class="picker-value">
						{{ deductDate }}
						<text class="arrow-icon">▶</text>
					</view>
				</picker>
			</view>
			<view class="label remark-label">扣课备注</view>
			<textarea
				v-model="remark"
				placeholder="请输入本次扣课的备注说明..."
				class="remark-input"
				maxlength="200"
			/>
		</view>

		<!-- 底部操作栏 -->
		<PageFooter
			:buttons="[{ text: '确认扣课', type: 'primary' }]"
			@btnClick="handleSubmit"
		></PageFooter>
	</view>
</template>

<script setup lang="ts">
	import { ref } from "vue";
	import { showToast, usePageData } from "@/utils/common";
	import PageFooter from "@/components/page-footer/index.vue";
	import DeductByStudent from "./component/deduct-by-student/index.vue";
	import DeductByCourse from "./component/deduct-by-course/index.vue";
	// 💡 引入你对应的扣课 API
	import { deductByStudentId, deductByCourseId } from "@/api/course-record";

	// 💡 获取当前日期的辅助函数 (格式: YYYY-MM-DD)
	const getTodayDate = () => {
		const date = new Date();
		const year = date.getFullYear();
		const month = String(date.getMonth() + 1).padStart(2, "0");
		const day = String(date.getDate()).padStart(2, "0");
		return `${year}-${month}-${day}`;
	};

	usePageData<FastDeductPageTransfer>((res) => {
		console.log("translateData", res);
		uni.$emit("updateStudent", res.student);
	});

	/** 扣课模式：student 按学生扣课，course 按课程扣课 */
	const deductMode = ref<"student" | "course">("student");
	/** 💡 新增：扣课日期，默认初始化为当天 */
	const deductDate = ref(getTodayDate());
	/** 扣课备注 */
	const remark = ref("");

	/** 按学生扣课时的负载数据 */
	const studentPayload = ref<DeductByStudentPayload | null>(null);

	/** 按课程扣课时的负载数据 */
	const coursePayload = ref<DeductByCoursePayload | null>(null);

	/** 切换扣课模式 */
	const switchMode = (mode: "student" | "course") => {
		if (deductMode.value === mode) return;
		deductMode.value = mode;
	};

	/** 💡 新增：处理日期变更 */
	const handleDateChange = (e: any) => {
		deductDate.value = e.detail.value;
	};

	/** 处理按学生扣课模式的数据更新 */
	const handleStudentDataUpdate = (data: DeductByStudentPayload) => {
		studentPayload.value = data;
	};

	/** 处理按课程扣课模式的数据更新 */
	const handleCourseDataUpdate = (data: DeductByCoursePayload) => {
		coursePayload.value = data;
	};

	/** 提交扣课请求 */
	const handleSubmit = async () => {
		uni.showLoading({ title: "处理中...", mask: true });
		let finalDate = deductDate.value + " 00:00:00";
		try {
			if (deductMode.value === "student") {
				console.log("按学生扣课时的负载数据", studentPayload.value);

				if (!studentPayload.value?.isValid) {
					return showToast("请选择学生并至少勾选一个班级");
				}

				// 拼接最终请求体
				const finalData: FastDeductRequest = {
					mode: "student",
					studentId: studentPayload.value.studentId,
					recordTime: finalDate,
					remark: remark.value,
					classes: studentPayload.value.classes,
				};
				await deductByStudentId(finalData);
			} else {
				console.log("按课程扣课时的负载数据", coursePayload.value);
				if (!coursePayload.value?.isValid) {
					return showToast({ msg: "请选择课程并至少勾选一名学生" });
				}

				// 拼接按课程扣课的请求体
				const finalData: FastDeductRequest = {
					mode: "course",
					courseId: coursePayload.value.courseId,
					recordTime: finalDate,
					remark: remark.value,
					students: coursePayload.value.students,
				};
				await deductByCourseId(finalData);
			}

			uni.hideLoading();
			showToast({ msg: "扣课成功", icon: "success" });
			remark.value = "";
			deductDate.value = getTodayDate();

			// 成功后可以通过 uni.$emit 通知子组件刷新列表数据
			uni.$emit("refreshDeductList");
		} catch (err) {
			uni.hideLoading();
			console.error(err);
		}
	};
</script>

<style lang="scss" scoped src="./index.scss"></style>
