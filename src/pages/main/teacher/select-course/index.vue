<template>
	<view class="selector-page">
		<SearchFilterBar
			v-model:keyword="keyword"
			placeholder="搜索课程名称"
			@search="onSearch"
			class="search-filter-bar"
		/>
		<scroll-view scroll-y class="list-container">
			<view
				class="course-item"
				v-for="item in list"
				:key="item.id"
				@tap="select(item)"
			>
				<view class="course-icon">
					<image src="/static/icon/bachelor-cap.svg" mode="aspectFit"></image>
				</view>
				<view class="course-info">
					<text class="name">{{ item.courseName }}</text>
					<text class="desc">{{
						`${item.courseType === 1 ? "按次" : "按天"}扣费`
					}}</text>
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
	import SearchFilterBar from "@/components/search-filter-bar/index.vue";

	const keyword = ref("");

	const list = ref<CourseResponse[]>([]);

	onLoad(async () => {
		loadData();
	});

	const onSearch = () => {
		console.log(keyword.value);
		loadData();
	};

	const loadData = async () => {
		const res = await getCourseByInstitutionId({
			institutionId: 1,
			keyword: keyword.value,
			currentPage: 1,
			pageSize: 100,
		});
		list.value = res.courses;
	};

	const select = (item: CourseResponse) => {
		uni.$emit("updateCourse", item);
		uni.navigateBack();
	};
</script>

<style lang="scss" scoped src="./index.scss"></style>
