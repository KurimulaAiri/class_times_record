<template>
	<view class="selector-page">
		<view class="search-bar">
			<icon type="search" size="14" color="#999" />
			<input v-model="keyword" placeholder="搜索课程名称" clearable="true" />
		</view>

		<scroll-view scroll-y class="list-container">
			<view
				class="course-item"
				v-for="item in list"
				:key="item.id"
				@tap="select(item)"
			>
				<view class="course-icon">📚</view>
				<view class="course-info">
					<text class="name">{{ item.courseName }}</text>
					<text class="desc">{{ item.courseType }}</text>
				</view>
				<uni-icons type="right" size="14" color="#eee"></uni-icons>
			</view>
		</scroll-view>
	</view>
</template>

<script setup lang="ts">
	import { ref } from "vue";
	import { getCourseByInstitutionId } from "@/api/course";
	import { onLoad } from "@dcloudio/uni-app";

	const keyword = ref("");

	const list = ref<CourseResponse[]>([]);

	onLoad(async () => {
		const res = await getCourseByInstitutionId({
			institutionId: 1,
			currentPage: 1,
			pageSize: 100,
		});
		list.value = res.courses;
	});

	const select = (item: CourseResponse) => {
		uni.$emit("updateCourse", item);
		uni.navigateBack();
	};
</script>

<style lang="scss" scoped src="./index.scss"></style>
