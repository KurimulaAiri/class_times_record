<!-- components/DeductByCourse.vue -->
<template>
	<view class="component-container">
		<!-- 选择课程/班级区域 -->
		<view class="section select-course" @tap="navigateToSelectCourse">
			<view class="label">选择课程班级</view>
			<view class="content">
				<text v-if="courseClass.className" class="name">
					{{ courseClass.courseName }} - {{ courseClass.className }}
				</text>
				<text v-else class="placeholder">请选择扣课班级</text>
				<uni-icons type="right" size="16" color="#999"></uni-icons>
			</view>
		</view>

		<!-- 班级学员列表 -->
		<view class="section-title" v-if="students && students.length > 0"
			>选择扣课学员（可多选）</view
		>

		<scroll-view
			scroll-y
			class="course-list"
			v-if="students && students.length > 0"
		>
			<view
				v-for="item in students"
				:key="item.id"
				class="course-card"
				:class="{ active: selectedMap[item.id] !== undefined }"
				@tap="toggleStudent(item)"
			>
				<view class="course-info">
					<view class="course-header">
						<text class="course-name">{{ item.studentName }}</text>
					</view>
					<view class="course-detail">
						<text
							>绑定主要家长：{{ item.primaryParent?.username || "暂无" }} ({{
								item.primaryParent?.phone || "-"
							}})</text
						>
						<text>剩余课时：{{ item.courseRestTime ?? 0 }} 课时</text>
					</view>
				</view>

				<!-- 右侧扣课数量控制 -->
				<view
					class="deduct-control"
					v-if="selectedMap[item.id] !== undefined"
					@tap.stop="() => {}"
				>
					<text class="btn minus" @tap.stop="changeCount(item.id, -1)">-</text>
					<input
						type="number"
						v-model.number="selectedMap[item.id].count"
						class="count-input"
						@tap.stop="() => {}"
					/>
					<text class="btn plus" @tap.stop="changeCount(item.id, 1)">+</text>
					<text class="unit">课时</text>
				</view>

				<view class="unselected-check" v-else>
					<uni-icons type="circle" size="20" color="#ccc"></uni-icons>
				</view>
			</view>
		</scroll-view>

		<!-- 空状态 -->
		<view class="empty-state" v-else>
			<image
				src="/static/icon/empty-search.svg"
				mode="aspectFit"
				class="empty-img"
			></image>
			<text v-if="courseClass.classId">该班级暂无在读学员</text>
			<text v-else>请先选择课程班级以加载学员列表</text>
		</view>
	</view>
</template>

<script setup lang="ts">
	import { ref, watch, onUnmounted } from "vue";
	import { jump } from "@/utils/common";
	import { ROUTES } from "@/config/routes";
	// 💡 注意：此处需要换成你实际根据班级ID获取学生列表的API
	import { getStudentListByClassId } from "@/api/student";

	const courseClass = ref<any>({
		classId: 0,
		className: "",
		courseId: 0,
		courseName: "",
	});
	const students = ref<Student[]>([]);
	const selectedMap = ref<Record<number, { detail: Student; count: number }>>(
		{},
	);

	watch(
		selectedMap,
		(newMap) => {
			const selectedEntries = Object.values(newMap);
			const result = {
				classId: courseClass.value.classId,
				courseId: courseClass.value.courseId,
				isValid: courseClass.value.classId > 0 && selectedEntries.length > 0,
				// 将结构整理成方便后端批量处理的格式
				students: selectedEntries.map((entry) => ({
					studentId: entry.detail.id,
					deductCount: entry.count,
				})),
			};
			uni.$emit("updateData", result);
		},
		{ deep: true },
	);

	const toggleStudent = (item: any) => {
		if (selectedMap.value[item.studentId] !== undefined) {
			const newMap = { ...selectedMap.value };
			delete newMap[item.studentId];
			selectedMap.value = newMap;
		} else {
			selectedMap.value = {
				...selectedMap.value,
				[item.studentId]: { detail: item, count: 1 },
			};
		}
	};

	const changeCount = (id: number, delta: number) => {
		const target = selectedMap.value[id];
		if (target) {
			const next = target.count + delta;
			if (next >= 1) target.count = next;
		}
	};

	// 跳转去选择课程班级的页面
	const navigateToSelectCourse = () => {
		// 假设你有这个路由，如果没有，可以跳转到已有选择页
		jump(ROUTES.SELECT_CLASS || "/pages/class/select-course-class");
	};

	const loadStudents = async () => {
		if (courseClass.value.classId !== 0) {
			// 调用接口获取班级下的学生名单
			const res = await getStudentListByClassId(courseClass.value.classId);
			students.value = res || [];
		}
	};

	// 监听跨页面选完课程班级后的回调
	uni.$on("updateCourseClass", async (data: any) => {
		courseClass.value = data;
		selectedMap.value = {};
		await loadStudents();
	});

	onUnmounted(() => {
		uni.$off("updateCourseClass");
	});
</script>
<style scoped lang="scss" src="./index.scss"></style>
