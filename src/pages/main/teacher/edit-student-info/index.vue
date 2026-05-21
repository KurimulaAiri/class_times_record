<template>
	<view class="container">
		<!-- 基础信息部分 (逻辑与添加页一致) -->
		<view class="form-group">
			<view class="group-title">基础信息</view>
			<view class="form-item">
				<text class="label">学生姓名<text class="required">*</text></text>
				<input
					class="input"
					v-model="form.studentName"
					placeholder="请输入姓名"
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
					<view :class="['picker-value', !form.birthStr && 'placeholder']">
						{{ form.birthStr || "请选择日期" }}
					</view>
				</picker>
			</view>

			<view class="form-item">
				<text class="label">在读学校</text>
				<input
					class="input"
					v-model="form.school"
					placeholder="请输入学校名称"
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
		<!-- 主要联系人部分 -->
		<view class="form-group">
			<view class="group-title">主要联系人</view>

			<!-- 情况 A: 已经有信息或点击了添加 -->
			<block
				v-if="
					form.primaryParent && form.primaryParent.hasOwnProperty('parentId')
				"
			>
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
			</block>

			<!-- 情况 B: 信息为空，显示添加按钮 -->
			<view v-else class="add-placeholder" @tap="initParent('primary')">
				<text class="plus-icon">+</text>
				<text>添加主要联系人</text>
			</view>
		</view>

		<!-- 备用联系人部分 -->
		<view class="form-group">
			<view class="group-title">备用联系人 (可选)</view>

			<!-- 情况 A: 已经有信息或点击了添加 -->
			<block
				v-if="
					form.secondaryParent &&
					form.secondaryParent.hasOwnProperty('parentId')
				"
			>
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
			</block>

			<!-- 情况 B: 信息为空，显示添加按钮 -->
			<view v-else class="add-placeholder" @tap="initParent('secondary')">
				<text class="plus-icon">+</text>
				<text>添加备用联系人</text>
			</view>
		</view>

		<view class="footer">
			<button class="submit-btn" @tap="submitForm">保存修改</button>
		</view>
	</view>
</template>

<script setup lang="ts">
	import { ref } from "vue";
	import { onLoad } from "@dcloudio/uni-app";
	import { useStudentStore } from "@/stores/student";
	import { updateStudent } from "@/api/student";

	const themeColor = ref("#70a9a2");
	const studentStore = useStudentStore();

	const genders = [
		{ name: "男", value: 1 },
		{ name: "女", value: 0 },
	];

	const form = ref<Student>({
		id: 0,
		avatar: "",
		studentName: "",
		sex: -1,
		relation: "",
		birthStr: "",
		school: "",
		address: "",
		institutions: [],
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
		courseTotalTime: 0,
		courseRestTime: 0,
		createTimeStr: "",
		updateTimeStr: "",
	});

	// 1. 页面加载时获取 ID 并查询详情
	onLoad(() => {
		fetchStudentDetail();
	});

	// 修改 fetchStudentDetail 中的逻辑，确保如果后端返回的是 null，则不自动回显表单
	const fetchStudentDetail = async () => {
		if (!studentStore.studentInfo) return;
		uni.showLoading({ title: "加载中..." });
		try {
			const res = JSON.parse(JSON.stringify(studentStore.studentInfo)); // 深拷贝一份

			// 如果后端返回的 parent 为 null，这里不要合并，或者合并后删掉，以便触发 v-else
			Object.assign(form.value, res);

			console.log("回显后的数据：", form.value);
		} catch (error) {
			console.error("获取详情失败", error);
		} finally {
			uni.hideLoading();
		}
	};

	// 初始化家长信息对象
	const initParent = (type: "primary" | "secondary") => {
		const emptyParent: Parent = {
			studentId: form.value.id,
			parentId: 0,
			username: "",
			relation: "",
			phone: "",
			isPrimary: false
		};

		if (type === "primary") {
			emptyParent.isPrimary = true;
			form.value.primaryParent = emptyParent;
		} else {
			if (!form.value.primaryParent) {
				uni.showToast({ title: "请先添加主要联系人", icon: "none" });
			} else {
				emptyParent.isPrimary = false;
				form.value.secondaryParent = emptyParent;
			}
		}
	};

	const onGenderChange = (e: any) => {
		form.value.sex = Number(e.detail.value);
	};

	const onDateChange = (e: any) => {
		form.value.birthStr = e.detail.value;
	};

	const submitForm = async () => {
		// 校验逻辑与添加页面一致
		if (!form.value.studentName)
			return uni.showToast({ title: "姓名不能为空", icon: "none" });

		if (form.value.primaryParent) {
			if (
				!form.value.primaryParent.username ||
				!form.value.primaryParent.phone ||
				!form.value.primaryParent.relation
			) {
				return uni.showToast({ title: "请完善主要联系人信息", icon: "none" });
			}
		}

		let hasAny = false;

		if (form.value.secondaryParent) {
			const sp = form.value.secondaryParent;
			hasAny = Boolean(sp.username || sp.phone || sp.relation);
			const isComplete = Boolean(sp.username && sp.phone && sp.relation);
			if (hasAny && !isComplete) {
				return uni.showToast({ title: "请完善备用联系人信息", icon: "none" });
			}
		}

		// 构造提交数据
		const submitData: UpdateStudentForm = { ...form.value };

		if (!hasAny) {
			submitData.secondaryParent = null;
		}

		try {
			uni.showLoading({ title: "保存中..." });
			const res = await updateStudent(submitData); // 调用更新接口
			uni.showToast({ title: "修改成功", icon: "success" });
			setTimeout(() => {
				uni.navigateBack()
				uni.$emit("needRefresh");
			}, 1500);
		} catch (error) {
			// 错误由拦截器处理
		} finally {
		}
	};
</script>

<style scoped lang="scss" src="./index.scss"></style>
