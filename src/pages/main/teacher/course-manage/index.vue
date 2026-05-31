<template>
	<view class="container">
		<!-- 悬浮置顶的搜索框 -->
		<SearchFilterBar
			v-model:keyword="keyword"
			placeholder="输入课程名称查找课程"
			@search="handleSearch"
			class="search-filter-bar"
		/>

		<!-- ✅ 新增：课程列表区域 -->
		<view class="course-list">
			<view
				v-for="item in courses"
				:key="item.id"
				class="course-card"
				hover-class="card-hover-effect"
				hover-stay-time="150"
				@tap="handleCourseClick(item)"
			>
				<!-- 课程左侧的装饰小图标/前缀（可选，增加精致感） -->
				<image class="course-icon" src="@/static/icon/bachelor-cap.svg"></image>

				<!-- 课程内容区域 -->
				<view class="course-content">
					<text class="course-name">{{ item.courseName }}</text>
					<text class="course-type">{{ item.courseType === 1 ? "按次" : "按天" }}</text>
				</view>

				<!-- 右侧装饰箭头 -->
				<text class="arrow-icon">▶</text>
			</view>

			<!-- ✅ 空状态提示（当搜索不到课程时展示） -->
			<view v-if="courses.length === 0" class="empty">
				<view class="empty-icon">🔍</view>
				<text class="empty-text">未找到相关课程</text>
			</view>
		</view>
		<!-- 新增：右下角悬浮按钮 -->
		<FloatingActionButton @click="goToAddCourse" />
	</view>
</template>

<script setup lang="ts">
	import { ref } from "vue";
	import { useUserStore } from "@/stores/user";
	import { getCourseByInstitutionId } from "@/api/course";
	import { onShow } from "@dcloudio/uni-app";
	import { ROUTES } from "@/config/routes";

	import SearchFilterBar from "@/components/search-filter-bar/index.vue";
	import FloatingActionButton from "@/components/floating-action-button/index.vue";
	import { jump } from "@/utils/common";

	const userStore = useUserStore();

	const keyword = ref("");

	/** 全部课程数据 */
	const allCourses = ref<CourseResponse[]>([]);

	/** 过滤后的课程数据 */
	const courses = ref<CourseResponse[]>([...allCourses.value]);

	/** 跳转到添加课程页面 */
	const goToAddCourse = () => {
		console.log("点击了添加课程按钮");
		// 这里可以写跳转逻辑，例如：
		// uni.navigateTo({ url: "/pages/course/add" });
		jump(ROUTES.ADD_COURSE);
	};

	onShow(() => {
		loadData();
	});

	// 触发搜索
	const handleSearch = (searchVal: string) => {
		keyword.value = searchVal.trim();
		console.log("正在搜索课程：", keyword.value);
		loadData();
		// ✅ 前端简单筛选逻辑（等对接后端 API 时可以替换为请求接口）
	};

	/** 加载课程列表数据 */
	const loadData = async () => {
		const res = await getCourseByInstitutionId({
			institutionId:
				userStore.userInfo?.roleId === 4
					? userStore.userInfo.identityInfo?.institutionId || 0
					: 0,
			keyword: keyword.value || "",
			currentPage: 1,
			pageSize: 100,
		});
		courses.value = res.courses || [];
		console.log("课程列表:", courses.value);
	};

	/** 点击课程卡片，跳转到课程详情 */
	const handleCourseClick = (item: CourseResponse) => {
		console.log("点击了课程：", item);
		// 这里可以写跳转逻辑，例如：
		// uni.navigateTo({ url: `/pages/course/detail?id=${item.id}` })
		jump(ROUTES.COURSE_DETAIL, item);
	};
</script>

<style scoped lang="scss" src="./index.scss"></style>
