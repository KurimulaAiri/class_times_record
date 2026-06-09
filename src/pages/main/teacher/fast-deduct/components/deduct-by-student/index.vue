<!-- components/DeductByStudent.vue -->
<template>
	<view class="component-container">
		<!-- 选择学生区域 -->
		<view class="section select-student" @tap="navigateToSelect">
			<view class="label">选择学生</view>
			<view class="content">
				<text v-if="student.studentName" class="name">{{
					student.studentName
				}}</text>
				<text v-else class="placeholder">请选择扣课学生</text>
				<uni-icons type="right" size="28rpx" color="#999"></uni-icons>
			</view>
		</view>

		<!-- 班级信息顶部控制栏（含全选） -->
		<view class="list-header" v-if="classes && classes.length > 0">
			<view class="section-title">班级课时信息（可多选）</view>
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
			v-if="classes && classes.length > 0"
		>
			<view
				v-for="item in classes"
				:key="item.id"
				class="course-card"
				:class="{ active: selectedMap[item.id] !== undefined }"
				@tap="toggleClass(item)"
			>
				<view class="course-info">
					<view class="course-header">
						<text class="course-name">{{ item.className }}</text>
					</view>
					<view class="course-detail">
						<text
							>任教老师：{{
								item.teachers.map((t) => t.username).join("、")
							}}</text
						>
						<text>课程名称：{{ item.courseName }}</text>
						<text
							>该种课程剩余课时：{{
								item.courseRecord?.courseRestTime ?? 0
							}}</text
						>
					</view>
				</view>

				<!-- 右侧输入区域 -->
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
			<text v-if="student.id">暂无关联的班级课时信息</text>
			<text v-else>请先选择学生以查看班级列表</text>
		</view>
	</view>
</template>

<script setup lang="ts">
	import { ref, computed, watch, onUnmounted } from "vue";
	import { jump } from "@/utils/common";
	import { ROUTES } from "@/config/routes";
	import { getClassListByStudentId } from "@/api/class";

	const themeColor = ref("#70a9a2");

	const emit = defineEmits(["updateData"]);

	const student = ref<StudentResponse>({} as StudentResponse);
	const classes = ref<ClassResponse[]>([]);
	const selectedMap = ref<Record<number, { detail: any; count: number }>>({});

	// 💡 计算属性：动态判断当前是否处于全选状态
	const isAllSelected = computed(() => {
		if (classes.value.length === 0) return false;
		return classes.value.every(
			(item) => selectedMap.value[item.id] !== undefined,
		);
	});

	// 监听选择映射变化，实时向父组件抛出当前拼装好的数据
	watch(
		selectedMap,
		(newMap) => {
			const selectedEntries = Object.values(newMap);
			const result: DeductByStudentPayload = {
				studentId: student.value.id,
				isValid: student.value.id > 0 && selectedEntries.length > 0,
				classes: selectedEntries.map((entry) => ({
					classId: entry.detail.id,
					courseId: entry.detail.courseId,
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
			// 当前非全选，则把所有未选中的班级都加上，默认 1 课时
			const tempMap: Record<number, { detail: any; count: number }> = {};
			classes.value.forEach((item) => {
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

	/** 切换班级选中状态 */
	const toggleClass = (item: any) => {
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

	/** 跳转到选择学生页面 */
	const navigateToSelect = () => {
		jump(ROUTES.SELECT_STUDENT);
	};

	/** 加载学生关联的班级列表 */
	const loadData = async () => {
		if (student.value.id !== 0) {
			const classesInfo = await getClassListByStudentId({
				studentId: student.value.id,
				currentPage: 1,
				pageSize: 1000,
			});
			classes.value = classesInfo.classList || [];
		}
	};

	// 页面通信监听
	uni.$on("updateStudent", async (data: StudentResponse) => {
		console.log("updateStudent调用");
		student.value = data;
		selectedMap.value = {};
		await loadData();
	});

	uni.$on("refreshDeductListStudent", async () => {
		console.log("refreshDeductList调用, in deduct-by-student");
		await loadData();
	});

	onUnmounted(() => {
		uni.$off("updateStudent");
		uni.$off("refreshDeductListStudent");
	});
</script>

<style scoped lang="scss" src="./index.scss"></style>
