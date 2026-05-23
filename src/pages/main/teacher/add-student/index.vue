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
					<view :class="['picker-value', !form.birth && 'placeholder']">
						{{ form.birth || "请选择日期" }}
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
					v-model="form.primaryParent.username"
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
					v-model="form.secondaryParent.username"
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
	import { insertStudent } from "@/api/student";
	import { useUserStore } from "@/stores/user";

	const userStore = useUserStore();

	const themeColor = ref("#70a9a2"); // 你的主题色

	const currentTeacher =
		userStore.userInfo?.roleId === 4 ? userStore.userInfo?.identityInfo : null;

	const genders = [
		{ name: "男", value: 1 },
		{ name: "女", value: 0 },
	];

	const form = reactive<InsertStudentRequest>({
		studentName: "",
		institutionId: currentTeacher?.institutionId || 0,
		sex: 1,
		birth: "",
		school: "",
		address: "",
		primaryParent: {
			studentId: 0,
			parentId: 0,
			username: "",
			relation: "",
			phone: "",
			isPrimary: true
		},
		secondaryParent: {
			studentId: 0,
			parentId: 0,
			username: "",
			relation: "",
			phone: "",
			isPrimary: false
		},
	});

	const onGenderChange = (e: any) => {
		form.sex = Number(e.detail.value);
	};

	const onDateChange = (e: any) => {
		form.birth = e.detail.value;
	};

	const submitForm = async () => {
		// 1. 基础校验
		if (!form.studentName)
			return uni.showToast({ title: "姓名不能为空", icon: "none" });
		if (
			!form.primaryParent.username ||
			!form.primaryParent.phone ||
			!form.primaryParent.relation
		) {
			return uni.showToast({ title: "请完善主要联系人信息", icon: "none" });
		}

		// 2. 备用联系人逻辑判断
		const sp = form.secondaryParent;
		const hasAny = Boolean(sp.username || sp.phone || sp.relation);
		const isComplete = Boolean(sp.username && sp.phone && sp.relation);

		if (hasAny && !isComplete) {
			return uni.showToast({ title: "请完善备用联系人信息", icon: "none" });
		}

		// 3. 构造提交对象 (解决 TS 类型问题)
		// 使用展开运算符克隆数据，这样不会影响页面渲染
		const submitData: any = { ...form };

		// 如果完全没填，设为 null
		if (!hasAny) {
			submitData.secondaryParent = null;
		}

		submitData;

		console.log("最终提交数据：", submitData);

		try {
			const studentId = await insertStudent(submitData);
			console.log("插入学生ID:", studentId);
			if (studentId) {
				uni.showToast({ title: "添加成功", icon: "success" });
				// 成功后延迟返回
				setTimeout(() => uni.navigateBack(), 1500);
			}
		} catch (error) {
			// 这里的错误会被你的全局拦截器或异常处理器捕获
		}
	};
</script>

<style scoped lang="scss" src="./index.scss"></style>
