<template>
	<view class="container">
		<view class="form-group">
			<view class="group-title">基础信息</view>

			<view class="form-item">
				<text class="label">学生姓名<text class="required">*</text></text>
				<input
					class="input"
					v-model="form.studentName"
					placeholder="请输入姓名"
					placeholder-class="placeholder"
				/>
			</view>

			<view class="form-item">
				<text class="label">性别</text>
				<radio-group class="radio-group" @change="onGenderChange">
					<label class="radio-item" v-for="item in genders" :key="item.value">
						<radio
							:value="item.value"
							:checked="form.sex === item.value"
							:color="themeColor"
						/>
						<text>{{ item.name }}</text>
					</label>
				</radio-group>
			</view>

			<view class="form-item">
				<text class="label">出生日期</text>
				<picker mode="date" @change="onDateChange">
					<view :class="['picker-value', !form.birthday && 'placeholder']">
						{{ form.birthday || "请选择日期" }}
					</view>
				</picker>
			</view>

			<view class="form-item">
				<text class="label">在读学校</text>
				<input
					class="input"
					v-model="form.school"
					placeholder="请输入学校名称"
					placeholder-class="placeholder"
				/>
			</view>

			<view class="form-item no-border">
				<text class="label">家庭住址</text>
				<textarea
					class="textarea"
					v-model="form.address"
					placeholder="请输入详细地址"
					auto-height
				/>
			</view>
		</view>

		<view class="form-group">
			<view class="group-title">主要联系人</view>
			<view class="form-item">
				<text class="label">家长姓名<text class="required">*</text></text>
				<input
					class="input"
					v-model="form.primaryParent.name"
					placeholder="请输入家长姓名"
				/>
			</view>
			<view class="form-item">
				<text class="label">关系<text class="required">*</text></text>
				<input
					class="input"
					v-model="form.primaryParent.relation"
					placeholder="如：爸爸、妈妈"
				/>
			</view>
			<view class="form-item no-border">
				<text class="label">联系电话<text class="required">*</text></text>
				<input
					class="input"
					type="number"
					v-model="form.primaryParent.phone"
					placeholder="请输入手机号"
					maxlength="11"
				/>
			</view>
		</view>

		<view class="form-group">
			<view class="group-title">备用联系人 (可选)</view>
			<view class="form-item">
				<text class="label">家长姓名</text>
				<input
					class="input"
					v-model="form.secondaryParent.name"
					placeholder="请输入家长姓名"
				/>
			</view>
			<view class="form-item">
				<text class="label">关系</text>
				<input
					class="input"
					v-model="form.secondaryParent.relation"
					placeholder="如：爷爷、奶奶"
				/>
			</view>
			<view class="form-item no-border">
				<text class="label">联系电话</text>
				<input
					class="input"
					type="number"
					v-model="form.secondaryParent.phone"
					placeholder="请输入手机号"
					maxlength="11"
				/>
			</view>
		</view>

		<view class="footer">
			<button class="submit-btn" @tap="submitForm">保存学生信息</button>
		</view>
	</view>
</template>

<script setup lang="ts">
	import { ref, reactive } from "vue";

	const themeColor = ref("#2979ff"); // 你的主题色

	const genders = [
		{ name: "男", value: 1 },
		{ name: "女", value: 2 },
	];

	const form = reactive({
		studentName: "",
		sex: 1,
		birthday: "",
		school: "",
		address: "",
		primaryParent: { name: "", relation: "", phone: "" },
		secondaryParent: { name: "", relation: "", phone: "" },
	});

	const onGenderChange = (e) => {
		form.sex = Number(e.detail.value);
	};

	const onDateChange = (e) => {
		form.birthday = e.detail.value;
	};

	const submitForm = () => {
		// 简单校验
		if (!form.studentName)
			return uni.showToast({ title: "姓名不能为空", icon: "none" });
		if (!form.primaryParent.name || !form.primaryParent.phone) {
			return uni.showToast({ title: "请完善主要联系人信息", icon: "none" });
		}

		console.log("提交数据：", form);
		// 调用接口逻辑...
	};
</script>

<style scoped lang="scss" src="./index.scss"></style>
