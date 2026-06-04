<template>
	<view>
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
				</view>
			</view>

			<view class="empty-state" v-if="courseRecordList.length === 0">
				<uni-icons type="search" size="40" color="#ccc"></uni-icons>
				<text>未搜索到相关课程</text>
			</view>
		</view>
	</view>
</template>

<script setup lang="ts">
	import SearchFilterBar from "@/components/search-filter-bar/index.vue";
	import { ref } from "vue";

	const courseRecordList = ref<CourseRecordResponse[]>([]);

	const handleCardClick = (item: CourseRecordResponse) => {
		console.log(item);
	};

	const handleCardLongPress = (item: CourseRecordResponse) => {
		console.log(item);
	};
</script>

<style scoped lang="scss" src="./index.scss"></style>
