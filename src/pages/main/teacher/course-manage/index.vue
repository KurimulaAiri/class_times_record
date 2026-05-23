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
	import { onLoad } from "@dcloudio/uni-app";
	import { ROUTES } from "@/config/routes";

	import SearchFilterBar from "@/components/search-filter-bar/index.vue";
	import FloatingActionButton from "@/components/floating-action-button/index.vue";
	import { jump } from "@/utils/common";

	// 定义课程的 TypeScript 接口
	interface Course {
		id: number;
		courseName: string;
		// 后续可以扩展：price, lessonPeriod 等
	}

	const userStore = useUserStore();

	const keyword = ref("");

	// ✅ 新增：模拟课程数据源（实际业务中可通过 API 获取）
	const allCourses = ref<Course[]>([
		{ id: 1, courseName: "创意少儿美术基础班" },
		{ id: 2, courseName: "硬笔书法进阶速成课" },
		{ id: 3, courseName: "少儿编程 Python 启蒙" },
		{ id: 4, courseName: "国际象棋初级博弈班" },
		{ id: 5, courseName: "架子鼓一对一私教课" },
	]);

	// 用于界面展示的响应式数组
	const courses = ref<Course[]>([...allCourses.value]);

	// 新增：添加课程的回调
	const goToAddCourse = () => {
		console.log("点击了添加课程按钮");
		// 这里可以写跳转逻辑，例如：
		// uni.navigateTo({ url: "/pages/course/add" });
		jump(ROUTES.ADD_COURSE);
	};

	onLoad(() => {
		loadData();
	});

	// 触发搜索
	const handleSearch = (searchVal: string) => {
		keyword.value = searchVal.trim();
		console.log("正在搜索课程：", keyword.value);
		loadData();
		// ✅ 前端简单筛选逻辑（等对接后端 API 时可以替换为请求接口）
	};

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

	// ✅ 新增：点击课程卡片的回调
	const handleCourseClick = (item: Course) => {
		console.log("点击了课程：", item);
		// 这里可以写跳转逻辑，例如：
		// uni.navigateTo({ url: `/pages/course/detail?id=${item.id}` })
		jump(ROUTES.COURSE_DETAIL, item);
	};
</script>

<style scoped lang="scss" src="./index.scss"></style>
