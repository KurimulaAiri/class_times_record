<template>
	<view class="container">
		<SearchFilterBar></SearchFilterBar>
		<view class="course-record-list">
			<view
				class="course-record-card"
				v-for="(item, index) in courseRecordList"
				:key="index"
				hover-class="card-hover-effect"
				hover-stay-time="150"
				@tap="handleCardClick(item)"
				@longpress="handleCardLongPress(item)"
			>
				<view class="card-header">
					<text class="course-name">{{
						item.course.courseName || "无课程"
					}}</text>
					<!-- <text
						:class="[
							'status-tag',
							item.status === 0 ? 'status-tag-danger' : 'status-tag-success',
						]"
						>{{ item.status === 0 ? "已结束" : "进行中" }}</text
					> -->
				</view>

				<view class="card-body">
					<view class="info-item">
						<text class="label">剩余课时：</text>
						<text class="value">{{ item.courseRestTime }}</text>
					</view>
					<view class="info-item">
						<text class="label">总课时：</text>
						<text class="value">{{ item.courseTotalTime }}</text>
					</view>
					<view class="info-item">
						<text class="label">到期时间：</text>
						<text class="value">{{ item.expireTimeStr?.split(' ')[0] }}</text>
					</view>
				</view>
			</view>

			<view class="empty-state" v-if="courseRecordList.length === 0">
				<uni-icons type="search" size="40" color="#ccc"></uni-icons>
				<text>未搜索到相关课程</text>
			</view>
		</view>
		<FloatingActionButton
			@click="jump(ROUTES.ADD_COURSE_RECORD)"
		></FloatingActionButton>
	</view>
</template>

<script setup lang="ts">
	import SearchFilterBar from "@/components/search-filter-bar/index.vue";
	import FloatingActionButton from "@/components/floating-action-button/index.vue";

	import { jump, usePageData } from "@/utils/common";
	import { getCourseRecordListByStudentId } from "@/api/course-record";
	import { ref, onUnmounted } from "vue";
	import { ROUTES } from "@/config/routes";

	const currentStudent = ref<StudentResponse>({} as StudentResponse);

	const courseRecordList = ref<CourseRecordResponse[]>([]);

	usePageData<StudentResponse>(async (student) => {
		console.log(student);
		currentStudent.value = student;
		const res = await getCourseRecordListByStudentId({
			studentId: currentStudent.value.id,
			currentPage: 1,
			pageSize: 100,
		});
		courseRecordList.value = res;
	});

	uni.$on("needRefresh", () => {
		loadData();
	});

	const loadData = async () => {
		const res = await getCourseRecordListByStudentId({
			studentId: currentStudent.value.id,
			currentPage: 1,
			pageSize: 100,
		});
		courseRecordList.value = res;
	};

	/** 处理卡片点击 */
	const handleCardClick = (item: CourseRecordResponse) => {
		console.log("点击了课程记录", item);
		jump(ROUTES.EDIT_COURSE_RECORD_INFO, item);
	};

	/** 处理卡片长按 */
	const handleCardLongPress = (item: CourseRecordResponse) => {
		console.log("长按了课程记录", item);
	};

	onUnmounted(() => {
		uni.$off("needRefresh");
	});
</script>

<style scoped lang="scss" src="./index.scss"></style>
