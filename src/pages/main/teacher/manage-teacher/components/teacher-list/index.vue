<template>
	<scroll-view class="teacher-list" scroll-y>
		<view v-if="loading" class="loading-wrap">
			<uni-load-more status="loading" />
		</view>

		<view v-else-if="teachers.length === 0" class="empty-state">
			<uni-icons type="person" size="40" color="#ccc"></uni-icons>
			<text>暂无教师</text>
		</view>

		<view v-else class="list">
			<TeacherCard
				v-for="teacher in teachers"
				:key="teacher.teacherId"
				:teacher="teacher"
				@contact="handleContact"
			/>
		</view>
	</scroll-view>
</template>

<script setup lang="ts">
	import { onMounted } from "vue";
	import { jump } from "@/utils/common";
	import { ROUTES } from "@/config/routes";
	import TeacherCard from "./teacher-card/index.vue";

	onMounted(() => {
		console.log("加载TeacherList");
	});

	const props = defineProps<{
		teachers: TeacherResponse[];
		loading?: boolean;
	}>();

	// 加这两行
	console.log("[debug] teachers =", props.teachers);
	console.log("[debug] loading =", props.loading);

	const handleContact = (teacher: TeacherResponse) => {
		jump(ROUTES.TEACHER_DETAIL, teacher, "navigate", true);
	};
</script>

<style scoped lang="scss" src="./index.scss"></style>
