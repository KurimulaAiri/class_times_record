<template>
	<view class="container">
		<view class="form-group">
			<view class="form-item avatar-section" @tap="chooseAvatar">
				<text class="label">学员头像</text>
				<view class="right-content">
					<view class="avatar-wrapper">
						<image
							v-if="submitData.avatar"
							:src="submitData.avatar"
							mode="aspectFill"
							class="avatar-img"
						></image>
						<uni-icons v-else type="camera" size="30" color="#999"></uni-icons>
					</view>
					<uni-icons type="right" size="18" color="#ccc"></uni-icons>
				</view>
			</view>

			<view class="form-item column">
				<text class="label">出生日期</text>
				<picker mode="date" :value="submitData.birth" @change="onDateChange">
					<view class="input-box">
						<uni-icons
							type="calendar"
							size="20"
							color="#999"
							class="icon"
						></uni-icons>
						<text :class="['text', !submitData.birth ? 'placeholder' : '']">
							{{ submitData.birth || "选择日期" }}
						</text>
					</view>
				</picker>
			</view>

			<view class="form-item column">
				<text class="label">就读学校</text>
				<view class="input-box">
					<input
						class="input"
						v-model="submitData.school"
						placeholder="请输入"
						placeholder-class="placeholder"
					/>
				</view>
			</view>

			<view class="form-item column">
				<text class="label">家庭住址</text>
				<view class="input-box">
					<input
						class="input"
						v-model="submitData.address"
						placeholder="请输入"
						placeholder-class="placeholder"
					/>
				</view>
			</view>
		</view>

		<view class="button-wrapper">
			<button class="save-btn" @tap="submitForm">保存</button>
		</view>
	</view>
</template>

<script setup lang="ts">
	import { PickerChangeEvent } from ".";
	import { ref } from "vue";
	import { onLoad } from "@dcloudio/uni-app";
	import { Student, EditStudentInfoForm, SubmitEditStudentInfoForm } from "@/types/student";
	import { updateStudentInfo } from "@/api/student";
	import { parseData } from "@/utils/common";

	onLoad((options) => {
		if (options) {
			const data: Student = parseData(options.data);
			console.log("studentList:", data);

			formData.value.id = data.id;
			formData.value.avatar = data.avatar;
			formData.value.birthStr = data.birthStr;
			formData.value.school = data.school;
			formData.value.address = data.address;

			submitData.value = {
				id: data.id,
				avatar: data.avatar,
				birth: data.birthStr,
				school: data.school,
				address: data.address,
			};
		}
	});

	const formData = ref<EditStudentInfoForm>({
		id: 0,
		avatar: "",
		birthStr: "",
		school: "",
		address: "",
	});

	const submitData = ref<SubmitEditStudentInfoForm>({
		id: 0,
		avatar: "",
		birth: "",
		school: "",
		address: "",
	});

	const chooseAvatar = () => {
		uni.chooseImage({
			count: 1,
			success: (res) => {
				submitData.value.avatar = res.tempFilePaths[0];
			},
		});
	};

	const onDateChange = (e: PickerChangeEvent) => {
		submitData.value.birth = e.detail.value;
	};

	const submitForm = () => {
		uni.showLoading({ title: "保存中..." });
		console.log("submitData:", submitData.value);

		if (submitData.value.birth === "" || submitData.value.birth === undefined || submitData.value.birth === "暂无记录") {
			uni.hideLoading();
			uni.showToast({ title: "请选择出生日期", icon: "error" });
			return;
		}

		if (submitData.value.school === "" || submitData.value.school === undefined) {
			uni.hideLoading();
			uni.showToast({ title: "请输入就读学校", icon: "error" });
			return;
		}

		if (submitData.value.address === "" || submitData.value.address === undefined) {
			uni.hideLoading();
			uni.showToast({ title: "请输入家庭住址", icon: "error" });
			return;
		}

		updateStudentInfo(submitData.value).then((res) => {
			if (res.code === 200) {
				uni.hideLoading();
				uni.showToast({ title: "保存成功", icon: "success" });
				setTimeout(() => {
					uni.navigateBack();
				}, 1000);
			} else {
				uni.hideLoading();
				uni.showToast({ title: res.message || "保存失败", icon: "error" });
			}
		});
	};
</script>

<style lang="scss" scoped src="./index.scss"></style>
