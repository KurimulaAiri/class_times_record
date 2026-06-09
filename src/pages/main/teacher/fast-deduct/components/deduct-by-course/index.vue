<!-- components/DeductByCourse.vue -->
<template>
	<view class="component-container">
		<!-- 选择课程/班级区域 -->
		<view class="section select-course" @tap="navigateToSelectCourse">
			<view class="label">选择课程</view>
			<view class="content">
				<text
					v-if="course.courseName && course.institution.institutionName"
					class="name"
				>
					{{ course.courseName }}
				</text>
				<text v-else class="placeholder">请选择扣课课程</text>
				<uni-icons type="right" size="28rpx" color="#999"></uni-icons>
			</view>
		</view>

		<!-- 班级学员列表顶部控制栏（含全选） -->
		<view class="list-header" v-if="students && students.length > 0">
			<view class="section-title">选择扣课学员（可多选）</view>
			<view class="select-all-btn" @tap="toggleSelectAll">
				<uni-icons
					:type="isAllSelected ? 'checkbox-filled' : 'circle'"
					size="18"
					:color="isAllSelected ? themeColor : '#999'"
				></uni-icons>
				<text class="select-all-text" :class="{ active: isAllSelected }"
					>全选</text
				>
			</view>
		</view>

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
			<text v-if="course.id">该课程暂无在读学员</text>
			<text v-else>请先选择课程以加载学员列表</text>
		</view>
	</view>
</template>

<script setup lang="ts">
	import { ref, computed, watch, onUnmounted } from "vue";
	import { jump } from "@/utils/common";
	import { ROUTES } from "@/config/routes";
	import { getStudentListByCourseId } from "@/api/student";

	const themeColor = ref("#70a9a2");

	const emit = defineEmits(["updateData"]);

	/** 当前选择的课程数据 */
	const course = ref<CourseResponse>({} as CourseResponse);
	const students = ref<StudentResponse[]>([]);
	const selectedMap = ref<
		Record<number, { detail: StudentResponse; count: number }>
	>({});

	// 计算属性：动态判断当前学员是否处于全选状态
	const isAllSelected = computed(() => {
		if (students.value.length === 0) return false;
		return students.value.every(
			(item) => selectedMap.value[item.id] !== undefined,
		);
	});

	watch(
		selectedMap,
		(newMap) => {
			const selectedEntries = Object.values(newMap);
			const result: DeductByCoursePayload = {
				courseId: course.value.id,
				isValid: course.value.id > 0 && selectedEntries.length > 0,
				students: selectedEntries.map((entry) => ({
					studentId: entry.detail.id,
					deductCount: entry.count,
				})),
			};
			emit("updateData", result);
		},
		{ deep: true },
	);

	// 💡 全选 / 反选点击事件
	const toggleSelectAll = () => {
		if (isAllSelected.value) {
			// 当前是全选，则清空
			selectedMap.value = {};
		} else {
			// 当前非全选，则把所有未选中的学员都加上，默认 1 课时
			const tempMap: Record<
				number,
				{ detail: StudentResponse; count: number }
			> = {};
			students.value.forEach((item) => {
				// 如果原本就已经有输入的课时数量，保留原数量，否则赋初始值 1
				const existCount = selectedMap.value[item.id]?.count;
				tempMap[item.id] = {
					detail: item,
					count: existCount || 1,
				};
			});
			selectedMap.value = tempMap;
		}
	};

	/** 切换学生选中状态 */
	const toggleStudent = (item: StudentResponse) => {
		if (selectedMap.value[item.id] !== undefined) {
			const newMap = { ...selectedMap.value };
			delete newMap[item.id];
			selectedMap.value = newMap;
		} else {
			selectedMap.value = {
				...selectedMap.value,
				[item.id]: { detail: item, count: 1 },
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

	/** 跳转到选择课程页面 */
	const navigateToSelectCourse = () => {
		jump(ROUTES.SELECT_COURSE);
	};

	/** 加载课程下的学生列表 */
	const loadStudents = async () => {
		if (course.value.id !== 0) {
			const res = await getStudentListByCourseId({
				courseId: course.value.id,
				currentPage: 1,
				pageSize: 1000,
			});
			students.value = res || [];
		}
	};

	uni.$on("updateCourse", async (data: CourseResponse) => {
		console.log("updateCourse调用");
		course.value = data;
		selectedMap.value = {};
		await loadStudents();
	});

	uni.$on("refreshDeductList", async () => {
		console.log("refreshDeductList调用");
		await loadStudents();
	});

	onUnmounted(() => {
		uni.$off("refreshDeductList");
		uni.$off("updateCourse");
	});
</script>
<style scoped lang="scss" src="./index.scss"></style>
