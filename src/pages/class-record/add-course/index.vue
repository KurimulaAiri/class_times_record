<template>
	<view class="content">
		<view class="top">
			<view class="add-form">
				<view class="form-item">
					<view class="form-item-label">学生姓名</view>
					<view class="form-item-input">
						<input
							class="form-item-input-text"
							v-model="data.stuName"
							placeholder="请输入学生姓名"
						/>
					</view>
				</view>
				<br />
				<view class="form-item">
					<view class="form-item-label">课程名称</view>
					<view class="form-item-input">
						<input
							class="form-item-input-text"
							v-model="data.courseName"
							placeholder="请输入课程名称"
						/>
					</view>
				</view>
				<view class="form-item">
					<view class="form-item-label">总课时</view>
					<view class="form-item-input">
						<input
							class="form-item-input-text"
							v-model="data.courseTotalTime"
							placeholder="请输入总课时"
						/>
					</view>
				</view>
				<view class="form-item">
					<view class="form-item-label">剩余课时</view>
					<view class="form-item-input">
						<input
							class="form-item-input-text"
							v-model="data.courseRestTime"
							placeholder="请输入剩余课时"
						/>
					</view>
				</view>
				<view class="form-item">
					<view class="form-item-label">备注</view>
					<view class="form-item-input">
						<input
							class="form-item-input-text"
							v-model="data.courseRemark"
							placeholder="请输入备注"
						/>
					</view>
				</view>
			</view>
			<view class="submit-btn" @click="submit">
				<view class="submit-btn-text">提交</view>
			</view>
		</view>
		<view class="bottom"> </view>
	</view>
</template>

<script setup lang="ts">
	import { ref } from "vue";
	import { post } from "@/utils/request";
	import { showToast } from "@/utils/common";
	import type { AddCourseRequest } from ".";

	/** 课卡记录数据 */
	const data = ref<AddCourseRequest>({
		stuName: "",
		courseName: "",
		courseTotalTime: null,
		courseRestTime: null,
		courseRemark: "",
	});

	/** 提交添加课卡记录 */
	const submit = () => {
		console.log(data.value);
		if (data.value.stuName === "") {
			showToast("请输入学生姓名", "none");
			return;
		}
		console.log(data.value.stuName);
		if (data.value.courseName === "") {
			showToast("请输入课程名称", "none");
			return;
		}
		if (data.value.courseTotalTime === null) {
			showToast("请输入总课时");
			return;
		}
		if (data.value.courseRestTime === null) {
			showToast("请输入剩余课时");
			return;
		}

		// 定义数字校验正则（正整数）
		const numReg = /^\d+$/;

		if (!numReg.test(data.value.courseTotalTime?.toString() || "")) {
			showToast("总课时必须是正整数", "none");
			return;
		}

		if (!numReg.test(data.value.courseRestTime?.toString() || "")) {
			showToast("剩余课时必须是正整数");
			return;
		}

		post("/course_record/add", data.value).then((res) => {
			console.log("添加课程响应:", res);
			if (res.code === 200) {
				showToast("添加成功", "success");
				uni.navigateBack({
					delta: 1,
				});
			} else {
				showToast(res.message);
			}
		});
	};
</script>

<style lang="scss" scoped src="./index.scss"></style>
