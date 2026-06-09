<template>
	<view class="container">
		<view class="header-bg">
			<view class="class-info">
				<text class="class-title">{{
					classDetail?.className || "班级详情"
				}}</text>
				<view
					:class="[
						'status-badge',
						classDetail?.status === 0
							? 'status-badge-danger'
							: 'status-badge-success',
					]"
					>{{ classDetail?.status === 0 ? "已结束" : "进行中" }}</view
				>
			</view>
		</view>

		<view class="summary-card">
			<view class="info-grid">
				<view class="info-item">
					<text class="label">授课教师</text>
					<text class="value">{{
						classDetail?.teachers
							?.map((teacher) => teacher.username)
							.join("、") || "无"
					}}</text>
				</view>
				<view class="info-item">
					<text class="label">课程类型</text>
					<text class="value">{{
						classDetail?.courseType === 1 ? "按次扣课" : "按时间扣课"
					}}</text>
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
							<text class="stu-no">剩余课时 {{ item.courseRestTime }}</text>
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

		<view class="list-section schedule-section">
			<view class="section-header">
				<view class="title-left">
					<text class="title-text">排课时间</text>
					<text class="count-tag">{{ aggregatedSchedule.length }}个周期</text>
				</view>
				<view class="action-right" @tap="handleEditSchedule">
					<uni-icons type="compose" size="14" :color="themeColor"></uni-icons>
					<text>调整排课</text>
				</view>
			</view>

			<view class="schedule-list" v-if="aggregatedSchedule.length > 0">
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
					</view>

					<view class="slots-box">
						<view
							class="slot-item"
							v-for="(slot, sIndex) in period.timeSlots"
							:key="slot.id || sIndex"
							hover-class="slot-item-hover"
							hover-stay-time="150"
							@tap="handleSlotTap(slot)"
							@longpress="handleSlotLongPress(slot)"
						>
							<view class="slot-left">
								<view
									v-if="
										sIndex === 0 ||
										period.timeSlots[sIndex - 1].dayOfWeek !== slot.dayOfWeek
									"
									class="day-badge"
									>{{ getDayOfWeekText(slot.dayOfWeek) }}</view
								>
								<view v-else class="day-badge day-badge-empty"></view>
								<view class="time-range">
									<text class="time-text"
										>{{ slot.startTimeStr }} - {{ slot.endTimeStr }}</text
									>
								</view>
							</view>

							<view class="slot-right">
								<view class="classroom-box" v-if="slot.classroom">
									<uni-icons type="location" size="14" color="#999"></uni-icons>
									<text class="classroom-text">{{ slot.classroom }}</text>
								</view>
								<text class="slot-remark" v-if="slot.remark">{{
									slot.remark
								}}</text>
							</view>
						</view>
					</view>
				</view>
			</view>

			<view class="empty-box min-empty" v-else>
				<image
					src="/static/icon/empty-search.svg"
					mode="aspectFit"
					class="empty-img"
				></image>
				<text>暂无排课时间段</text>
			</view>
		</view>

		<PageFooter
			:buttons="[
				{ text: '编辑班级', type: 'secondary' },
				{ text: '点名签到', type: 'primary' },
			]"
			@btn-click="handleFooterClick"
		/>
	</view>
</template>

<script setup lang="ts">
	import { onUnmounted, ref, computed } from "vue";
	import { onLoad, onShow } from "@dcloudio/uni-app";
	import { parseData, jump, showToast } from "@/utils/common";
	import { getStudentListByClassId } from "@/api/student";
	import { useStudentStore } from "@/stores/student";
	import { useUserStore } from "@/stores/user";
	import { ROUTES } from "@/config/routes";
	import {
		addStudentToClass,
		removeStudentFromClass,
		getClassByClassId,
	} from "@/api/class";
	import { getClassScheduleByClassId } from "@/api/class-schedule";
	import { deductByClassId } from "@/api/course-record";
	import PageFooter from "@/components/page-footer/index.vue";

	const themeColor = ref("#70a9a2"); // 对应你的 $theme-color
	const classDetail = ref<ClassResponse>();
	const userStore = useUserStore();
	const operatorId =
		userStore.userInfo?.roleId === 4
			? userStore.userInfo?.identityInfo.teacherId || 0
			: 0;

	const students = ref<StudentResponse[]>([]);
	const currentStudent = ref<StudentResponse>();

	// 3. 核心：通过计算属性，自动将平铺数据转为“日期段包裹时间段”的聚合结构
	const aggregatedSchedule = computed(() => {
		const list = classDetail.value?.scheduleList || [];
		if (list.length === 0) return [];

		const groups: {
			dateKey: string;
			startDate: string;
			endDate: string;
			timeSlots: ClassScheduleResponse[];
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
					timeSlots: [],
				};
				groups.push(group);
			}

			// 将当前的时间段推入该日期组中
			group.timeSlots.push(item);
		});

		// 对每个分组内的 timeSlots 按 dayOfWeek 升序，同一天内按 startTimeStr 升序排列
		groups.forEach((group) => {
			group.timeSlots.sort((a, b) => {
				if (a.dayOfWeek !== b.dayOfWeek) return a.dayOfWeek - b.dayOfWeek;
				return a.startTimeStr.localeCompare(b.startTimeStr);
			});
		});

		return groups;
	});

	// 获取当前日期的辅助函数 (格式: YYYY-MM-DD)
	const getTodayDate = () => {
		const date = new Date();
		const year = date.getFullYear();
		const month = String(date.getMonth() + 1).padStart(2, "0");
		const day = String(date.getDate()).padStart(2, "0");
		return `${year}-${month}-${day}`;
	};

	/** 将星期数字转换为中文文本 */
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

	/** 跳转到编辑课程表页面 */
	const handleEditSchedule = () => {
		console.log("点击调整排课");
		jump(ROUTES.ADJUST_CLASS_SCHEDULE);
	};

	onLoad(async (options) => {
		// 1. 优先从路由参数恢复基本数据
		if (options && options.data) {
			classDetail.value = parseData(options.data);
		}

		// 2. 接着从后端 API 刷新/获取最新的班级详情基本信息
		if (classDetail.value?.id) {
			try {
				const res = await getClassByClassId(classDetail.value.id);
				// 这里建议采用浅拷贝合并，防止有些页面传入的临时字段被直接盖掉
				classDetail.value = {
					...classDetail.value,
					...(res.classList?.[0] || {}),
				};
			} catch (err) {
				console.error("获取班级详情失败:", err);
			}
		}

		// 3. 🔥 最后再去加载关联的学员列表和排课列表数据
		// 这样排课表数据就会稳稳地挂载在最新的 classDetail 上，不会被覆盖了
		await Promise.all([loadStudentList(), loadClassScheduleList()]);

		console.log("班级详情最终初始化完成:", classDetail.value);
	});

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
								showToast({ msg: "添加成功", icon: "success" });
								if (classDetail.value?.id) {
									const res = await getClassByClassId(
										classDetail.value?.id || 0,
									);

									// ✅ 修复：保留原有的 scheduleList 不被覆盖
									classDetail.value = {
										...res.classList?.[0], // 后端返回的新班级基础数据
										scheduleList: classDetail.value.scheduleList, // 牢牢抱住我们原有的排课数据
									};
								}
							} else {
								showToast({ msg: "添加失败" });
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

	uni.$on("needRefresh", async () => {
		console.log("needRefresh in class-detail");
		await loadStudentList();
		await loadClassScheduleList();
		await getClassByClassId(classDetail.value?.id || 0);
	});

	uni.$on("backFromEditClass", async () => {
		const newClassDetail = await getClassByClassId(classDetail.value?.id || 0);
		if (newClassDetail) {
			classDetail.value = {
				...newClassDetail.classList?.[0], // 后端返回的新班级基础数据
				scheduleList: classDetail.value?.scheduleList || [], // 牢牢抱住我们原有的排课数据
			};
		}
		loadStudentList();
		loadClassScheduleList();
	});

	// 页面显示时获取班级详情
	onShow(async () => {
		await loadStudentList();
	});

	/** 加载课程表列表 */
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
			console.log(
				"aggregatedSchedule.value.length",
				aggregatedSchedule.value.length,
			);
		}
	};

	/** 加载班级学生列表 */
	const loadStudentList = async () => {
		const res = await getStudentListByClassId({
			classId: classDetail.value?.id || 0,
			currentPage: 1,
			pageSize: 100,
		});
		students.value = res;
	};

	/** 长按学生卡片，弹出操作菜单 */
	const handleLongPress = async (item: StudentResponse) => {
		uni.vibrateShort();

		uni.showActionSheet({
			itemList: ["编辑学生", "快速扣课", "移除学生"],
			itemColor: "#333",
			success: async (res) => {
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
						uni.showModal({
							title: "提示",
							content: `确定要移除 ${item.studentName} 吗？`,
							success: async (res) => {
								if (res.confirm) {
									// 执行移除逻辑...
									console.log("用户点击了确定");
									// 调用移除接口
									const result = await removeStudentFromClass({
										classId: classDetail.value?.id || 0,
										students: [item],
									});
									if (result !== 0) {
										setTimeout(() => {
											showToast({
												msg: "移除成功",
												icon: "success",
												duration: 2000,
											});
										}, 200);
										if (classDetail.value?.id) {
											const res = await getClassByClassId(
												classDetail.value?.id || 0,
											);

											// ✅ 修复：保留原有的 scheduleList 不被覆盖
											classDetail.value = {
												...res.classList?.[0], // 后端返回的新班级基础数据
												scheduleList: classDetail.value.scheduleList, // 牢牢抱住我们原有的排课数据
											};
										}
										// 刷新学员列表
										await loadStudentList();
									} else {
										setTimeout(() => {
											showToast("移除失败");
										}, 200);
									}
								} else if (res.cancel) {
									console.log("用户点击了取消");
								}
							},
						});

						break;
				}
			},
		});

		console.log("长按学员", item);
	};

	/** 跳转到添加学生页面 */
	const handleAddStudent = () => {
		jump(ROUTES.SELECT_STUDENT, { type: "multi" });
	};

	/** 底部按钮点击事件分发 */
	const handleFooterClick = (index: number) => {
		if (index === 0) handleEdit();
		else if (index === 1) handleAttendance();
	};

	/** 跳转到编辑班级信息页面 */
	const handleEdit = () => {
		jump(ROUTES.EDIT_CLASS_INFO, classDetail.value, "navigate", true);
	};

	/** 跳转到课卡记录页面 */
	const handleAttendance = async () => {
		uni.showModal({
			title: "提示",
			content: "是否进行点名（班级集体扣课）",
			showCancel: true,
			success: async ({ confirm, cancel }) => {
				if (confirm) {
					console.log("用户点击了确定");
					const res = await deductByClassId({
						mode: "class",
						deductCount: 1,
						classId: classDetail.value?.id || 0,
						recordTime: getTodayDate() + " 00:00:00",
						remark: "班级集体扣课",
						operatorId: operatorId,
					});
					if (res.result !== 0) {
						showToast("点名失败");
					} else {
						showToast("点名成功");
						// 刷新班级列表
						await loadStudentList();
					}
				} else {
					console.log("用户点击了取消");
				}
			},
		});
	};

	/** 拨打电话 */
	const makePhoneCall = (phone: string) => {
		if (!phone) return;
		uni.makePhoneCall({ phoneNumber: phone });
	};

	/** 跳转到学生详情页面 */
	const goToStudentDetail = (item: StudentResponse) => {
		console.log("点击学员", item);
		// 点击记录当前选中的学员
		currentStudent.value = item;
		// 点击记录当前选中的学员到store
		const studentStore = useStudentStore();
		studentStore.setStudentInfo(item);
		// 点击跳转学员详情页
		jump(ROUTES.STUDENT_DETAIL);
	};

	/** 点击时间段，跳转到排课详情 */
	const handleSlotTap = (slot: ClassScheduleResponse) => {
		jump(
			ROUTES.CLASS_SCHEDULE_DETAIL,
			{
				refreshEventFunctionName: "needRefresh",
				data: {
					dateKey: `${slot.startDateStr}_${slot.endDateStr}`,
					startDate: slot.startDateStr,
					endDate: slot.endDateStr,
					remark: slot.remark,
					timeSlots: [slot],
				} as PeriodItem,
			} as EditClassScheduleInfoPageTransfer,
			"navigate",
			true,
		);
	};

	/** 长按时间段 */
	const handleSlotLongPress = (slot: ClassScheduleResponse) => {
		uni.vibrateShort();
		uni.showActionSheet({
			itemList: ["编辑该排课", "删除该排课"],
			itemColor: "#333",
			success: (res) => {
				switch (res.tapIndex) {
					case 0:
						jump(
							ROUTES.EDIT_CLASS_SCHEDULE_INFO,
							{
								refreshEventFunctionName: "needRefresh",
								data: {
									dateKey: `${slot.startDateStr}_${slot.endDateStr}`,
									startDate: slot.startDateStr,
									endDate: slot.endDateStr,
									remark: slot.remark,
									timeSlots: [slot],
								} as PeriodItem,
							} as EditClassScheduleInfoPageTransfer,
							"navigate",
							true,
						);
						break;
					case 1:
						uni.showModal({
							title: "删除确认",
							content: "确定要删除该排课时间段吗？",
							confirmColor: "#dd524d",
							success: (modalRes) => {
								if (modalRes.confirm) {
									console.log("删除排课ID:", slot.id);
								}
							},
						});
						break;
				}
			},
		});
	};

	onUnmounted(() => {
		uni.$off("updateStudents");
		uni.$off("needRefresh");
		uni.$off("backFromEditClass");
	});
</script>

<style scoped lang="scss" src="./index.scss"></style>
