<template>
	<view class="container">
		<!-- 顶部背景装饰 -->
		<view class="header-bg"></view>

		<!-- 个人核心信息卡片 -->
		<view class="main-card">
			<view class="avatar-section">
				<view :class="['avatar-big', student?.sex === 1 ? 'male' : 'female']">
					{{ formatAvatarText(student?.studentName || "") }}
				</view>
			</view>
			<view class="name-section">
				<text class="name">{{ student?.studentName || "" }}</text>
				<text
					:class="[
						'gender-tag',
						student?.sex === 1 ? 'male-tag' : 'female-tag',
					]"
				>
					{{ student?.sex === 1 ? "男" : "女" }}
				</text>
			</view>
			<view class="id-badge">学号: {{ student?.id || "" }}</view>
		</view>

		<!-- 详细信息分组 -->
		<view class="info-group">
			<view class="group-title">基本信息</view>
			<view class="info-item">
				<text class="label">出生日期</text>
				<text class="value">{{ student?.birthStr || "未填写" }}</text>
			</view>
			<view class="info-item">
				<text class="label">就读学校</text>
				<text class="value">{{ student?.school || "未填写" }}</text>
			</view>
			<view class="info-item">
				<text class="label">家庭住址</text>
				<text class="value">{{ student?.address || "未填写" }}</text>
			</view>
		</view>

		<view class="info-group">
			<view class="group-title">联系人信息</view>
			<!-- 主要联系人 -->
			<view class="info-item" v-if="student?.primaryParent">
				<text class="label">主要联系人</text>
				<view class="value contact">
					<view class="relation-box">
						<text class="relation">{{ student.primaryParent.relation }}</text>
					</view>
					<view
						class="phone-wrapper"
						@tap="makePhoneCall(student.primaryParent.phone)"
					>
						<text class="phone">{{ student.primaryParent.phone }}</text>
						<!-- 替换图标为图片 -->
						<image
							class="phone-icon"
							src="/static/icon/phone.svg"
							mode="aspectFit"
						></image>
					</view>
				</view>
			</view>
			<!-- 次要联系人 -->
			<view class="info-item">
				<text class="label">备用联系人</text>
				<text class="value">{{
					student?.secondaryParent || "暂无备用联系人"
				}}</text>
			</view>
		</view>

		<view class="info-group">
			<view class="group-title">系统记录</view>
			<view class="info-item small">
				<text class="label">创建时间</text>
				<text class="value">{{ student?.createTimeStr || "未知" }}</text>
			</view>
			<view class="info-item small">
				<text class="label">最后更新</text>
				<text class="value">{{ student?.updateTimeStr || "未知" }}</text>
			</view>
		</view>

		<!-- 底部操作按钮 -->
		<view class="footer-btns">
			<view class="edit-btn" @tap="handleEdit">编辑档案</view>
		</view>
	</view>
</template>

<script setup lang="ts">
	import { ref } from "vue";
	import { useStudentStore } from "@/stores/student";
	import { Student } from "@/types/student";

	const studentStore = useStudentStore();
	// 模拟接收到的数据
	const student = ref<Student>();

	if (studentStore.studentInfo) {
		student.value = studentStore.studentInfo;
	}

	// 头像文字处理：取名字最后两个字
	const formatAvatarText = (name: string) => {
		if (!name) return "无";
		return name.length > 2 ? name.substring(name.length - 2) : name;
	};

	// 拨打联系人电话
	const makePhoneCall = (phoneNumber: string) => {
		uni.makePhoneCall({
			phoneNumber: phoneNumber,
		});
	};

	const handleEdit = () => {
		console.log("跳转编辑页");
	};
</script>

<style scoped lang="scss" src="./index.scss"></style>
