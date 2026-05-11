<template>
	<view class="container">
		<view class="header-bg">
			<view class="class-info">
				<text class="class-title">{{
					classDetail?.className || "班级详情"
				}}</text>
				<view class="status-badge">进行中</view>
			</view>
		</view>

		<view class="summary-card">
			<view class="info-grid">
				<view class="info-item">
					<text class="label">授课教师</text>
					<text class="value">{{ classDetail?.username || "老师" }}</text>
				</view>
				<view class="info-item">
					<text class="label">课程类型</text>
					<text class="value">{{ classDetail?.courseType || "课程类型" }}</text>
				</view>
				<view class="info-item">
					<text class="label">学生人数</text>
					<text class="value"
						>{{ classDetail?.studentCount || 0 }}人 /
						{{ classDetail?.studentMaxCount }}人</text
					>
				</view>
			</view>
			<view class="course-name-box">
				<uni-icons type="book" size="18" :color="themeColor"></uni-icons>
				<text class="course-label">所属课程：</text>
				<text class="course-value">{{
					classDetail?.courseName || "课程"
				}}</text>
			</view>
		</view>

		<view class="list-section">
			<view class="section-header">
				<view class="title-left">
					<text class="title-text">学生名单</text>
					<text class="count-tag">{{ students.length }}</text>
				</view>
				<view class="action-right" @tap="handleAddStudent">
					<uni-icons type="plusempty" size="14" :color="themeColor"></uni-icons>
					<text>添加学生</text>
				</view>
			</view>

			<view class="student-list">
				<view
					class="student-item"
					v-for="(item, index) in students"
					:key="item.id"
					hover-class="item-hover"
					@tap="goToStudentDetail(item)"
				>
					<view class="stu-info">
						<view :class="['stu-avatar', item.sex === 1 ? 'male' : 'female']">
							{{ item.studentName.substring(item.studentName.length - 1) }}
						</view>
						<view class="stu-detail">
							<text class="stu-name">{{ item.studentName }}</text>
							<text class="stu-no"
								>学号：{{ item.id }}； 剩余课时：{{ item.courseRestTime }}</text
							>
						</view>
					</view>
					<view
						v-if="item.primaryParent"
						class="stu-action"
						@tap.stop="makePhoneCall(item.primaryParent?.phone)"
					>
						<image src="/static/icon/phone.svg" class="phone-icon"></image>
					</view>
				</view>
			</view>

			<view class="empty-box" v-if="students.length === 0">
				<image
					src="/static/icon/empty-search.svg"
					mode="aspectFit"
					class="empty-img"
				></image>
				<text>暂无学生名单</text>
			</view>
		</view>

		<view class="bottom-bar">
			<button class="btn btn-outline" @tap="handleEdit">编辑班级</button>
			<button class="btn btn-main" @tap="handleAttendance">点名签到</button>
		</view>
	</view>
</template>

<script setup lang="ts">
	import { ref } from "vue";
	import { onLoad } from "@dcloudio/uni-app";
	import { parseData } from "@/utils/common";
	import { getStudentListByClassId } from "@/api/student";
	import { useStudentStore } from "@/stores/student";
	import { jump } from "@/utils/common";
	import { ROUTES } from "@/config/routes";

	const themeColor = ref("#70a9a2"); // 对应你的 $theme-color
	const classDetail = ref<Class>();

	const students = ref<Student[]>([]);
	const currentStudent = ref<Student>();

	onLoad((options) => {
		if (options) {
			classDetail.value = parseData(options.data);
			getStudentListByClassId({ classId: classDetail.value?.id || 0 }).then(
				(res) => {
					students.value = res;
				},
			);
		}
		console.log("班级详情:", classDetail.value);
	});

	const handleAddStudent = () => {
		uni.navigateTo({ url: "/pages/student/add" });
	};

	const handleEdit = () => {
		uni.navigateTo({ url: "/pages/class-edit/index" });
	};

	const handleAttendance = () => {
		uni.navigateTo({ url: "/pages/attendance/index" });
	};

	const makePhoneCall = (phone: string) => {
		if (!phone) return;
		uni.makePhoneCall({ phoneNumber: phone });
	};

	const goToStudentDetail = (item: Student) => {
		console.log("点击学员", item);
		// 点击记录当前选中的学员
		currentStudent.value = item;
		// 点击记录当前选中的学员到store
		const studentStore = useStudentStore();
		studentStore.setStudentInfo(item);
		// 点击跳转学员详情页
		jump(ROUTES.STUDENT_DETAIL);
	};
</script>

<style scoped lang="scss" src="./index.scss"></style>
