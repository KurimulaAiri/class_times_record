<template>
	<view class="container">
		<view class="header-bg">
			<view class="class-info">
				<text class="class-title">{{
					classDetail?.className || "班级详情"
				}}</text>
				<view class="status-badge">进行中</view>
			</view>
		</view>

		<view class="summary-card">
			<view class="info-grid">
				<view class="info-item">
					<text class="label">授课教师</text>
					<text class="value">{{
						classDetail?.teachers
							.map((teacher) => teacher.username)
							.join("、") || "无"
					}}</text>
				</view>
				<view class="info-item">
					<text class="label">课程类型</text>
					<text class="value">{{ classDetail?.courseType || "课程类型" }}</text>
				</view>
				<view class="info-item">
					<text class="label">学生人数</text>
					<text class="value"
						>{{ classDetail?.studentCount || 0 }}人 /
						{{ classDetail?.studentMaxCount }}人</text
					>
				</view>
			</view>
			<view class="course-name-box">
				<uni-icons type="book" size="18" :color="themeColor"></uni-icons>
				<text class="course-label">所属课程：</text>
				<text class="course-value">{{
					classDetail?.courseName || "课程"
				}}</text>
			</view>
		</view>

		<view class="list-section">
			<view class="section-header">
				<view class="title-left">
					<text class="title-text">学生名单</text>
					<text class="count-tag">{{ students.length }}</text>
				</view>
				<view class="action-right" @tap="handleAddStudent">
					<uni-icons type="plusempty" size="14" :color="themeColor"></uni-icons>
					<text>添加学生</text>
				</view>
			</view>

			<view class="student-list">
				<view
					class="student-item"
					v-for="(item, index) in students"
					:key="item.id"
					hover-class="item-hover"
					@tap="goToStudentDetail(item)"
					@longpress="handleLongPress(item)"
				>
					<view class="stu-info">
						<view :class="['stu-avatar', item.sex === 1 ? 'male' : 'female']">
							{{ item.studentName.substring(item.studentName.length - 1) }}
						</view>
						<view class="stu-detail">
							<text class="stu-name">{{ item.studentName }}</text>
							<text class="stu-no"
								>学号：{{ item.id }}； 剩余课时：{{ item.courseRestTime }}</text
							>
						</view>
					</view>
					<view
						v-if="item.primaryParent"
						class="stu-action"
						@tap.stop="makePhoneCall(item.primaryParent?.phone)"
					>
						<image src="/static/icon/phone.svg" class="phone-icon"></image>
					</view>
				</view>
			</view>

			<view class="empty-box" v-if="students.length === 0">
				<image
					src="/static/icon/empty-search.svg"
					mode="aspectFit"
					class="empty-img"
				></image>
				<text>暂无学生名单</text>
			</view>
		</view>

		<!-- ✅ 排课时间列表区域 -->
		<view class="list-section schedule-section">
			<view class="section-header">
				<view class="title-left">
					<text class="title-text">排课时间</text>
					<!-- 展示总共有多少个不同的日期服务周期 -->
					<text class="count-tag">{{ aggregatedSchedule.length }}个周期</text>
				</view>
				<view class="action-right" @tap="handleEditSchedule">
					<uni-icons type="compose" size="14" :color="themeColor"></uni-icons>
					<text>调整排课</text>
				</view>
			</view>

			<!-- 渲染聚合后的排课数据 -->
			 <!-- TODO 这里不知道为什么一直渲染不出来 -->
			<view class="schedule-list" v-if="aggregatedSchedule.length > 0">
				<!-- 第一层：渲染合并后的日期区间 -->
				<view
					class="period-card"
					v-for="(period, pIndex) in aggregatedSchedule"
					:key="period.dateKey"
				>
					<view class="period-header">
						<view class="date-range">
							<uni-icons type="calendar" size="16" color="#666"></uni-icons>
							<text class="date-text"
								>{{ period.startDate }} 至 {{ period.endDate }}</text
							>
						</view>
						<text class="period-remark" v-if="period.remark">{{
							period.remark
						}}</text>
					</view>

					<!-- 第二层：渲染该日期区间内包含的所有周内上课时间 -->
					<view class="slots-box">
						<view
							class="slot-item"
							v-for="(slot, sIndex) in period.timeSlots"
							:key="slot.id || sIndex"
						>
							<view class="slot-left">
								<view class="day-badge">{{
									getDayOfWeekText(slot.dayOfWeek)
								}}</view>
								<view class="time-range">
									<text class="time-text"
										>{{ slot.startTimeStr }} - {{ slot.endTimeStr }}</text
									>
								</view>
							</view>
							<view class="slot-right" v-if="slot.classroom">
								<uni-icons type="location" size="14" color="#999"></uni-icons>
								<text class="classroom-text">{{ slot.classroom }}</text>
							</view>
						</view>
					</view>
				</view>
			</view>

			<!-- 排课空状态 -->
			<view class="empty-box min-empty" v-else>
				<image
					src="/static/icon/empty-search.svg"
					mode="aspectFit"
					class="empty-img"
				></image>
				<text>暂无排课时间段</text>
			</view>
		</view>

		<view class="bottom-bar">
			<button class="btn btn-outline" @tap="handleEdit">编辑班级</button>
			<button class="btn btn-main" @tap="handleAttendance">点名签到</button>
		</view>
	</view>
</template>

<script setup lang="ts">
	import { onUnmounted, ref, computed } from "vue";
	import { onLoad, onShow } from "@dcloudio/uni-app";
	import { parseData } from "@/utils/common";
	import { getStudentListByClassId } from "@/api/student";
	import { useStudentStore } from "@/stores/student";
	import { jump } from "@/utils/common";
	import { ROUTES } from "@/config/routes";
	import { addStudentToClass, getClassByClassId } from "@/api/class";
	import { getClassScheduleByClassId } from "@/api/class-schedule";

	const themeColor = ref("#70a9a2"); // 对应你的 $theme-color
	const classDetail = ref<Class>();

	const students = ref<Student[]>([]);
	const currentStudent = ref<Student>();

	// 3. 核心：通过计算属性，自动将平铺数据转为“日期段包裹时间段”的聚合结构
	const aggregatedSchedule = computed(() => {
		const list = classDetail.value?.scheduleList || [];
		if (list.length === 0) return [];

		const groups: {
			dateKey: string;
			startDate: string;
			endDate: string;
			remark?: string;
			timeSlots: BackendScheduleItem[];
		}[] = [];

		list.forEach((item) => {
			// 使用 开始日期+结束日期 作为分组的唯一标识键
			const dateKey = `${item.startDateStr}_${item.endDateStr}`;

			// 寻找是否已经存在该日期段的分组
			let group = groups.find((g) => g.dateKey === dateKey);

			if (!group) {
				group = {
					dateKey,
					startDate: item.startDateStr,
					endDate: item.endDateStr,
					remark: item.remark,
					timeSlots: [],
				};
				groups.push(group);
			}

			// 将当前的时间段推入该日期组中
			group.timeSlots.push(item);
		});

		return groups;
	});

	// 数字周转换辅助函数
	const getDayOfWeekText = (day: number): string => {
		const weekMap: Record<number, string> = {
			1: "周一",
			2: "周二",
			3: "周三",
			4: "周四",
			5: "周五",
			6: "周六",
			7: "周日",
		};
		return weekMap[day] || `周${day}`;
	};

	const handleEditSchedule = () => {
		console.log("点击调整排课");
	};

	onLoad(async (options) => {
		if (options) {
			classDetail.value = parseData(options.data);
			await loadStudentList();
			await loadClassScheduleList();
		}
		if (classDetail.value?.id) {
			const res = await getClassByClassId(classDetail.value?.id || 0);
			classDetail.value = res.classList?.[0] || {};
		}
		console.log("班级详情:", classDetail.value);
	});

	// 页面显示时获取班级详情
	onShow(async () => {});

	const loadClassScheduleList = async () => {
		const res = await getClassScheduleByClassId({
			classId: classDetail.value?.id || 0,
			currentPage: 1,
			pageSize: 100,
		});
		if (classDetail.value) {
			classDetail.value.scheduleList = res;
			console.log("当前排课列表:", classDetail.value.scheduleList);
			console.log("聚合后的排课列表:", aggregatedSchedule.value);
			console.log("aggregatedSchedule.value.length", aggregatedSchedule.value.length);
		}
	};

	const loadStudentList = async () => {
		const res = await getStudentListByClassId({
			classId: classDetail.value?.id || 0,
			currentPage: 1,
			pageSize: 100,
		});
		students.value = res;
	};

	// 处理长按事件
	const handleLongPress = (item: Student) => {
		uni.vibrateShort();

		uni.showActionSheet({
			itemList: ["编辑学生", "快速扣课", "移除学生"],
			itemColor: "#333",
			success: (res) => {
				switch (res.tapIndex) {
					case 0:
						console.log("点击编辑");
						// 点击记录当前选中的学员
						currentStudent.value = item;
						// 点击记录当前选中的学员到store
						const studentStore = useStudentStore();
						studentStore.setStudentInfo(item);
						// 编辑
						jump(ROUTES.EDIT_STUDENT_INFO_TEACHER);
						break;
					case 1:
						console.log("快速扣课, id:", item.id);
						jump(ROUTES.FAST_DEDUCT, { student: item });
						break;
					case 2:
						console.log("移除学生");
						break;
				}
			},
		});

		console.log("长按学员", item);
	};

	const handleAddStudent = () => {
		jump(ROUTES.SELECT_STUDENT, { type: "multi" });
	};

	const handleEdit = () => {
		jump(ROUTES.EDIT_CLASS_INFO, classDetail.value);
	};

	const handleAttendance = () => {
		uni.navigateTo({ url: "/pages/attendance/index" });
	};

	const makePhoneCall = (phone: string) => {
		if (!phone) return;
		uni.makePhoneCall({ phoneNumber: phone });
	};

	const goToStudentDetail = (item: Student) => {
		console.log("点击学员", item);
		// 点击记录当前选中的学员
		currentStudent.value = item;
		// 点击记录当前选中的学员到store
		const studentStore = useStudentStore();
		studentStore.setStudentInfo(item);
		// 点击跳转学员详情页
		jump(ROUTES.STUDENT_DETAIL);
	};

	// 建议将监听放在 onLoad 或 script 顶层
	onLoad(() => {
		// 监听全局事件
		uni.$on("updateStudents", (data) => {
			// 1. 处理 Proxy 问题（切断响应式引用）
			const studentList = JSON.parse(JSON.stringify(data));

			console.log("接收到的原始数据:", data);
			console.log("转换后的纯对象:", studentList);

			if (studentList && studentList.length > 0) {
				// 2. 使用 showModal 而不是 showToast
				setTimeout(() => {
					uni.showModal({
						title: "提示",
						content: `确定要添加选中的 ${studentList.length} 名学员吗？`,
						success: async (res) => {
							if (res.confirm) {
								// 执行添加逻辑...
								console.log("用户点击了确定");
								// 调用添加接口
								const result = await addStudentToClass({
									classId: classDetail.value?.id || 0,
									students: studentList,
								});
								if (result !== 0) {
									uni.showToast({
										title: "添加成功",
										icon: "success",
									});
									if (classDetail.value?.id) {
										const res = await getClassByClassId(
											classDetail.value?.id || 0,
										);
										classDetail.value = res.classList?.[0] || {};
									}
								} else {
									uni.showToast({
										title: "添加失败",
										icon: "none",
									});
								}
								await loadStudentList();
							} else if (res.cancel) {
								console.log("用户点击了取消");
							}
						},
					});
				}, 200);
			}
		});

		uni.$on("needRefresh", () => {
			loadStudentList();
		});
	});

	onUnmounted(() => {
		uni.$off("updateStudents");
		uni.$off("needRefresh");
	});
</script>

<style scoped lang="scss" src="./index.scss"></style>
