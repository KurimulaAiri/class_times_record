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
	import { post } from "../../utils/request";

	const data = ref({
		stuName: "",
		courseName: "",
		courseTotalTime: "",
		courseRestTime: "",
		courseRemark: "",
	});

	const submit = () => {
		console.log(data.value);
		if (data.value.studentName === "") {
			uni.showToast({
				title: "请输入学生姓名",
				icon: "none",
			});
			return;
		}
		console.log(data.value.studentName);
		if (data.value.courseName === "") {
			uni.showToast({
				title: "请输入课程名称",
				icon: "none",
			});
			return;
		}
		if (data.value.courseTotalTime === "") {
			uni.showToast({
				title: "请输入总课时",
				icon: "none",
			});
			return;
		}
		if (data.value.courseRestTime === "") {
			uni.showToast({
				title: "请输入剩余课时",
				icon: "none",
			});
			return;
		}

		// 定义数字校验正则（正整数）
		const numReg = /^\d+$/;

		if (!numReg.test(data.value.courseTotalTime)) {
			uni.showToast({
				title: "总课时必须是正整数",
				icon: "none",
			});
			return;
		}

		if (!numReg.test(data.value.courseRestTime)) {
			uni.showToast({
				title: "剩余课时必须是正整数",
				icon: "none",
			});
			return;
		}

		post("/course_record/add", data.value).then((res) => {
			console.log("添加课程响应:", res);
			if (res.code === 200) {
				uni.showToast({
					title: "添加成功",
					icon: "success",
				});
				uni.navigateBack({
					delta: 1,
				});
			} else {
				uni.showToast({
					title: res.msg,
					icon: "none",
				});
			}
		});
	};
</script>

<style lang="scss">
	@import "../../static/scss/index.scss";

	.content {
		height: 100vh;
		padding: 20rpx;
		background-color: $theme-color;
	}

	.top {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		margin-bottom: 20rpx;
	}

	.add-form {
		width: 95%;
		margin: 0 auto;
		height: 80%;
		overflow: auto;
		background-color: white;
		display: flex;
		flex-direction: column;
		padding: 20rpx;
		border-radius: 20rpx;
	}

	.form-item {
		height: 30px;
		display: flex;
		align-content: center;
		flex-wrap: nowrap;
		justify-content: space-around;
		flex-direction: row;
		align-items: center;
		margin-bottom: 20rpx;
	}

	.form-item-label {
		width: 200rpx;
	}

	.form-item-input {
		display: flex;
		align-items: center;
		justify-content: flex-start;
		flex-direction: row;
		width: 600rpx;
		height: 30px;
	}

	.submit-btn {
		margin-top: 20rpx;
		width: 95%;
		height: 50px;
		padding: 0 20rpx;
		background-color: white;
		color: #fff;
		font-size: 20px;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 25rpx;
	}

	.submit-btn:active {
		background-color: #f3f3f3;
	}

	.submit-btn-text {
		font-size: 20px;
		color: $theme-color;
	}
</style>
