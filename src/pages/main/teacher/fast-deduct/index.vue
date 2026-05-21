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
			<view class="label">扣课备注</view>
			<textarea
				v-model="remark"
				placeholder="请输入本次扣课的备注说明..."
				class="remark-input"
				maxlength="200"
			/>
		</view>

		<!-- 底部操作栏 -->
		<view class="footer">
			<button class="submit-btn" @tap="handleSubmit">确认扣课</button>
		</view>
	</view>
</template>

<script setup lang="ts">
	import { ref } from "vue";
	import DeductByStudent from "./component/deduct-by-student/index.vue";
	import DeductByCourse from "./component/deduct-by-course/index.vue";
	// 💡 引入你对应的扣课 API
	import { deductByStudentId, deductByCourseId } from "@/api/course-record";

	const deductMode = ref<"student" | "course">("student");
	const remark = ref("");

	// 接收子组件组装好的数据
	const studentPayload = ref<any>(null);
	const coursePayload = ref<any>(null);

	const switchMode = (mode: "student" | "course") => {
		if (deductMode.value === mode) return;
		deductMode.value = mode;
	};

	const handleStudentDataUpdate = (data: any) => {
		studentPayload.value = data;
	};

	const handleCourseDataUpdate = (data: any) => {
		coursePayload.value = data;
	};

	// 统一提交口
	const handleSubmit = async () => {
		uni.showLoading({ title: "处理中...", mask: true });

		try {
			if (deductMode.value === "student") {
				if (!studentPayload.value?.isValid) {
					return uni.showToast({
						title: "请选择学生并至少勾选一个班级",
						icon: "none",
					});
				}

				// 拼接最终请求体
				const finalData = {
					studentId: studentPayload.value.studentId,
					remark: remark.value,
					classes: studentPayload.value.classes,
				};

				await deductByStudentId(finalData);
			} else {
				if (!coursePayload.value?.isValid) {
					return uni.showToast({
						title: "请选择班级并至少勾选一名学生",
						icon: "none",
					});
				}

				// 拼接按课程扣课的请求体
				const finalData = {
					// classId: coursePayload.value.classId,
					// courseId: coursePayload.value.courseId,
					// remark: remark.value,
					// students: coursePayload.value.students,
				};

				//  TODO 调用按课程扣减的后端接口 
				// await deductByCourseId(finalData);
			}

			uni.hideLoading();
			uni.showToast({ title: "扣课成功", icon: "success" });
			remark.value = "";

			// 成功后可以通过 uni.$emit 通知子组件刷新列表数据
			uni.$emit("refreshDeductList");
		} catch (err) {
			uni.hideLoading();
			console.error(err);
		}
	};
</script>

<style lang="scss" scoped src="./index.scss"></style>
