<template>
	<view class="container">
		<!-- 💡 修复增改：带平滑滑动动画的互斥切换模式按钮 -->
		<view class="mode-tab-box">
			<!-- 背后滑动的白色/主题色胶囊滑块 -->
			<view
				class="tab-slider"
				:class="{ 'slide-right': deductMode === 'course' }"
			></view>

			<!-- 前景文字选项 -->
			<view
				class="tab-item"
				:class="{ active: deductMode === 'student' }"
				@tap="switchMode('student')"
				>按学员扣课</view
			>
			<view
				class="tab-item"
				:class="{ active: deductMode === 'course' }"
				@tap="switchMode('course')"
				>按课程扣课</view
			>
		</view>

		<!-- 选择学生区域（仅在按学员模式或未选择课程时作为辅助显示，这里默认都留着但文案随模式改变） -->
		<view class="section select-student" @tap="navigateToSelect">
			<view class="label">{{
				deductMode === "student" ? "选择学生" : "指定学生"
			}}</view>
			<view class="content">
				<text v-if="student.studentName" class="name">{{
					student.studentName
				}}</text>
				<text v-else class="placeholder">请选择扣课学生</text>
				<uni-icons type="right" size="16" color="#999"></uni-icons>
			</view>
		</view>

		<!-- 班级信息展示区 -->
		<view class="section-title" v-if="classes && classes.length > 0"
			>班级课时信息（可多选）</view
		>

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
								item.teachers.map((teacher) => teacher.username).join("、")
							}}</text
						>
						<text>课程名称：{{ item.courseName }}</text>
						<text
							>该种课程剩余课时：{{ item.courseRecord.courseRestTime }}</text
						>
					</view>
				</view>

				<!-- 右侧输入区域 -->
				<view
					class="deduct-control"
					v-if="selectedMap[item.id] !== undefined"
					@tap.stop="() => {}"
				>
					<!-- 减号 -->
					<text class="btn minus" @tap.stop="changeCount(item.id, -1)">-</text>

					<!-- 输入框 -->
					<input
						type="number"
						v-model.number="selectedMap[item.id].count"
						class="count-input"
						@tap.stop="() => {}"
					/>

					<!-- 加号 -->
					<text class="btn plus" @tap.stop="changeCount(item.id, 1)">+</text>

					<text class="unit">课时</text>
				</view>

				<!-- 未选中时的勾选提示 -->
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
			<text v-if="classes && classes.length === 0">暂无关联的班级课时信息</text>
			<text v-else>请先选择信息以查看班级列表</text>
		</view>

		<!-- 备注展示区 -->
		<view class="section-title">其他信息</view>
		<!-- 备注区域 -->
		<view class="section remark-section">
			<view class="label">扣课备注</view>
			<textarea
				v-model="submitData.remark"
				placeholder="请输入本次扣课的备注说明..."
				class="remark-input"
				maxlength="200"
			/>
		</view>

		<!-- 底部操作栏 -->
		<view class="footer">
			<button class="submit-btn" @tap="handleSubmit">确认扣课</button>
		</view>
	</view>
</template>

<script setup lang="ts">
	import { jump, parseData } from "@/utils/common";
	import { ROUTES } from "@/config/routes";
	import { ref, onUnmounted } from "vue";
	import { onLoad } from "@dcloudio/uni-app";
	import { getClassListByStudentId } from "@/api/class";
	import { deductByStudentId } from "@/api/course-record";

	// 💡 新增状态：扣课模式 'student'(按学员) 或 'course'(按课程)
	const deductMode = ref<"student" | "course">("student");

	// 状态管理
	const student = ref<Student>({
		id: 0,
		avatar: "",
		studentName: "",
		sex: 0,
		relation: "",
		birthStr: "",
		school: "",
		address: "",
		institutions: [],
		primaryParent: {
			username: "",
			studentId: 0,
			parentId: 0,
			relation: "",
			phone: "",
			isPrimary: false,
		},
		secondaryParent: {
			username: "",
			studentId: 0,
			parentId: 0,
			relation: "",
			phone: "",
			isPrimary: false,
		},
		courseTotalTime: 0,
		courseRestTime: 0,
		createTimeStr: "",
		updateTimeStr: "",
	});

	const classes = ref<Class[]>();
	// 存储已选班级的详细信息
	// 修改状态管理定义
	// key 仍为 classId，但 value 包含对象和计数
	const selectedMap = ref<Record<number, { detail: Class; count: number }>>({});

	const submitData = ref<FastDeductRequest>({
		studentId: 0,
		remark: "",
		classes: [],
	});

	// 切换选择状态
	const toggleClass = (item: Class) => {
		if (selectedMap.value[item.id] !== undefined) {
			// 解构删除，触发响应式更新
			const newMap = { ...selectedMap.value };
			delete newMap[item.id];
			selectedMap.value = newMap;
		} else {
			// 存储整个对象，默认次数为 1
			selectedMap.value = {
				...selectedMap.value,
				[item.id]: {
					detail: item,
					count: 1,
				},
			};
		}
	};

	// 修正加减方法
	const changeCount = (id: number, delta: number) => {
		const target = selectedMap.value[id];
		if (target) {
			const next = target.count + delta;
			if (next >= 1) {
				target.count = next;
			}
		}
	};

	// 💡 新增：切换扣课模式逻辑
	const switchMode = (mode: "student" | "course") => {
		if (deductMode.value === mode) return;
		deductMode.value = mode;

		// 切换模式时清空已选数据，避免数据混乱
		classes.value = [];
		selectedMap.value = {};
		student.value.id = 0;
		student.value.studentName = "";
		submitData.value.studentId = 0;
		submitData.value.classes = [];
	};

	// 跳转选择学生界面
	const navigateToSelect = () => {
		jump(ROUTES.SELECT_STUDENT);
	};

	// 提交逻辑
	const handleSubmit = async () => {
		if (!student.value.id)
			return uni.showToast({ title: "请选择学生", icon: "none" });

		const selectedEntries = Object.values(selectedMap.value);
		if (selectedEntries.length === 0)
			return uni.showToast({ title: "请至少选择一个班级", icon: "none" });

		// 组装提交数据：现在可以轻松拿到 detail.courseId
		submitData.value.classes = selectedEntries.map((entry) => ({
			classId: entry.detail.id,
			courseId: entry.detail.courseId, // 从存储的对象中取出
			deductCount: entry.count,
		}));

		console.log("提交的数据：", submitData.value);
		uni.showLoading({ title: "处理中..." });
		await deductByStudentId(submitData.value);
		await loadData();
		submitData.value.remark = "";
		uni.showToast({ title: "扣课成功" });
	};

	// 监听学生更新时清空之前的选择
	onLoad(async (options) => {
		if (options) {
			const res: any = parseData(options.data);
			console.log("options", res);
			if (res) {
				student.value = res.student;
				submitData.value.studentId = student.value.id;
				await loadData();
			}
		}

		uni.$on("updateStudent", async (data: Student) => {
			console.log("updateStudent", data);
			student.value = data;
			selectedMap.value = {}; // 重置选择
			console.log("选中学生：", student.value);
			submitData.value.studentId = student.value.id;
			await loadData();
		});
	});

	const loadData = async () => {
		if (student.value.id !== 0) {
			const classesInfo = await getClassListByStudentId(student.value.id);
			console.log("classes", classesInfo);
			classes.value = classesInfo.classList;
		}
	};

	onUnmounted(() => {
		uni.$off("updateStudent");
	});
</script>

<style lang="scss" scoped src="./index.scss"></style>
