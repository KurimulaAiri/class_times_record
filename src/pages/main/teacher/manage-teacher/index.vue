<template>
	<view class="container">
		<SearchFilterBar class="search-filter-bar"></SearchFilterBar>
		<TeacherList :teachers="teacherList" :loading="loading" />
		<FloatingActionButton
			class="floating-action-button"
			@tap="handleClickButton"
		></FloatingActionButton>
	</view>
</template>

<script setup lang="ts">
	import { ref } from "vue";
	import SearchFilterBar from "@/components/search-filter-bar/index.vue";
	import TeacherList from "./components/teacher-list/index.vue";
	import FloatingActionButton from "@/components/floating-action-button/index.vue";
	import { jump } from "@/utils/common";
	import { ROUTES } from "@/config/routes";
	import { getTeachersByInstitutionId } from "@/api/teacher";
	import { useUserStore } from "@/stores/user";
	import { onLoad, onShow } from "@dcloudio/uni-app";

	const userStore = useUserStore();

	const loading = ref(false);
	const teacherList = ref<TeacherResponse[]>([]);

	const handleClickButton = () => {
		jump(ROUTES.ADD_TEACHER);
	};

	/** 加载教师列表 */
	const loadTeachers = async () => {
		loading.value = true;
		try {
			const res = await getTeachersByInstitutionId({
				institutionId:
					userStore.userInfo?.roleId === 4
						? userStore.userInfo?.identityInfo.institutionId
						: 0,
				currentPage: 1,
				pageSize: 100,
			});
			teacherList.value = res.teachers;
		} catch (error) {
			console.error("加载教师列表失败:", error);
		} finally {
			loading.value = false;
		}
	};

	onLoad(async () => {
		await loadTeachers();
	});

	onShow(() => {
		uni.$once("needRefreshTeacher", () => {
			loadTeachers();
		});
	});
</script>

<style scoped lang="scss" src="./index.scss"></style>
