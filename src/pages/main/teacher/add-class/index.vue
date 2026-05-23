<template>
	<view class="container">
		<!-- 基础信息卡片 -->
		<view class="form-group">
			<view class="group-title">基础信息</view>

			<view class="form-item">
				<text class="label">班级名称<text class="required">*</text></text>
				<input
					class="input-value"
					v-model="form.className"
					placeholder="请输入班级名称"
					placeholder-class="placeholder"
				/>
			</view>

			<view class="form-item" @tap="toSelectCourse">
				<text class="label">关联课程<text class="required">*</text></text>
				<view class="picker-value-wrapper">
					<text :class="['picker-value', !form.courseId && 'placeholder']">
						{{ courseName || "请选择" }}
					</text>
					<uni-icons type="right" size="14" color="#ccc"></uni-icons>
				</view>
			</view>

			<view class="form-item">
				<text class="label">人数上限</text>
				<view class="stepper">
					<view class="step-btn" @tap="form.maxCount > 1 && form.maxCount--"
						>-</view
					>
					<input class="step-input" type="number" v-model="form.maxCount" />
					<view class="step-btn" @tap="form.maxCount++">+</view>
				</view>
			</view>

			<view class="form-item no-border block-item">
				<view class="label-row">
					<text class="label">任课老师<text class="required">*</text></text>
					<view class="add-teacher-btn" @tap="toSelectTeacher">
						<uni-icons
							type="staff-filled"
							size="14"
							:color="themeColor"
						></uni-icons>
						<text>选择老师</text>
					</view>
				</view>

				<view class="teacher-tags" v-if="selectedTeachers.length > 0">
					<view
						class="tag"
						v-for="(t, i) in selectedTeachers"
						:key="t.teacherId"
					>
						<text>{{ t.username }}</text>
						<text class="tag-close" @tap="removeTeacher(i)">×</text>
					</view>
				</view>
				<view v-else class="empty-tip">未选择老师</view>
			</view>
		</view>

		<!-- 上课日程安排部分 -->
		<view class="form-group">
			<view class="group-title"
				>上课日程安排<text class="required">*</text></view
			>

			<!-- 已添加的排班日程列表 -->
			<block v-if="form.schedules && form.schedules.length > 0">
				<view
					class="schedule-card-item"
					v-for="(item, index) in form.schedules"
					:key="index"
				>
					<view class="card-header">
						<text class="card-index">时段方案 {{ index + 1 }}</text>
						<text class="card-delete" @tap="removeSchedule(index)">删除</text>
					</view>

					<!-- 1. 周几单选 -->
					<view class="form-item block-item no-padding-top">
						<text class="label sub-label">上课周期</text>
						<view class="week-days-container">
							<view
								v-for="day in weekOptions"
								:key="day.value"
								:class="['week-tag', item.dayOfWeek === day.value && 'active']"
								@tap="toggleWeekDay(index, day.value)"
							>
								{{ day.label }}
							</view>
						</view>
					</view>

					<!-- 2. 有效日期段 -->
					<view class="form-item">
						<text class="label sub-label">有效日期</text>
						<view class="range-picker-box">
							<picker
								mode="date"
								:value="item.startDate"
								@change="handleStartDateChange(index, $event)"
							>
								<view :class="['date-text', !item.startDate && 'placeholder']">
									{{ item.startDate || "开始日期" }}
								</view>
							</picker>
							<text class="range-split">至</text>
							<picker
								mode="date"
								:value="item.endDate"
								:start="item.startDate"
								@change="item.endDate = $event.detail.value"
							>
								<view :class="['date-text', !item.endDate && 'placeholder']">
									{{ item.endDate || "结束日期" }}
								</view>
							</picker>
						</view>
					</view>

					<!-- 3. 上课时间段 -->
					<view class="form-item no-border">
						<text class="label sub-label">上课时间</text>
						<view class="range-picker-box">
							<picker
								mode="time"
								:value="item.startTime"
								@change="item.startTime = $event.detail.value"
							>
								<view :class="['date-text', !item.startTime && 'placeholder']">
									{{ item.startTime || "开始时间" }}
								</view>
							</picker>
							<text class="range-split">至</text>
							<picker
								mode="time"
								:value="item.endTime"
								@change="item.endTime = $event.detail.value"
							>
								<view :class="['date-text', !item.endTime && 'placeholder']">
									{{ item.endTime || "结束时间" }}
								</view>
							</picker>
						</view>
					</view>

					<!-- 💡 新增：4. 日程备注输入框 -->
					<view class="form-item no-border block-item">
						<text class="label sub-label">时段备注</text>
						<textarea
							class="remark-textarea"
							v-model="item.remark"
							placeholder="请输入该时段的备注信息"
							placeholder-class="placeholder"
							auto-height
							:maxlength="200"
						/>
					</view>
				</view>
			</block>

			<!-- 添加空位提示 -->
			<view class="add-placeholder" @tap="addSchedule">
				<text class="plus-icon">+</text>
				<text>{{
					form.schedules.length > 0 ? "追加一组上课时段" : "添加上课日程时段"
				}}</text>
			</view>
		</view>

		<!-- 底部固定的安全区域提交栏 -->
		<view class="footer">
			<button class="submit-btn" @tap="submitForm">创建班级</button>
		</view>
	</view>
</template>

<script setup lang="ts">
	import { ref, onUnmounted } from "vue";
	import { onLoad } from "@dcloudio/uni-app";
	import { jump } from "@/utils/common";
	import { ROUTES } from "@/config/routes";
	import { insertClass } from "@/api/class";

	// 周几数据源配置
	const weekOptions = [
		{ label: "周一", value: 1 },
		{ label: "周二", value: 2 },
		{ label: "周三", value: 3 },
		{ label: "周四", value: 4 },
		{ label: "周五", value: 5 },
		{ label: "周六", value: 6 },
		{ label: "周日", value: 7 },
	];

	const themeColor = "#70a9a2";
	const form = ref<InsertClassRequest>({
		className: "",
		courseId: 0,
		maxCount: 30,
		teachers: [] as TeacherResponse[], // 选中的老师
		schedules: [] as ClassScheduleResponse[], // 动态追加的日程数组
	});

	// 初始化或追加一组空的排班
	const addSchedule = () => {
		form.value.schedules.push({
            classId: null,
			dayOfWeek: 0,
			startDate: "",
			endDate: "",
			startTime: "",
			endTime: "",
		});
	};

	const courseName = ref("");

	const selectedTeachers = ref<TeacherResponse[]>([]);

	onLoad(() => {
		uni.$on("updateCourse", (res: CourseResponse) => {
			console.log("选择的课程", res);
			form.value.courseId = res.id;
			courseName.value = res.courseName;
		});

		uni.$on("updateTeachers", (res: TeacherResponse[]) => {
			console.log("选择的老师", res);
			form.value.teachers = res;
			selectedTeachers.value = res;
		});
	});

	onUnmounted(() => {
		uni.$off(["updateCourse", "updateTeachers"]);
	});

	// 删除特定的一组排班
	const removeSchedule = (index: number) => {
		uni.showModal({
			title: "提示",
			content: "确定要删除这一组上课时段吗？",
			success: (res) => {
				if (res.confirm) {
					form.value.schedules.splice(index, 1);
				}
			},
		});
	};

	// 内部处理：特定排班组的周几单选（原多选改为单选）
	const toggleWeekDay = (scheduleIndex: number, dayValue: number) => {
		const target = form.value.schedules[scheduleIndex];

		// 如果已经选中了当前星期，再次点击则取消选中（留空）；如果点击其他星期，则直接覆盖成新的值
		if (target.dayOfWeek === dayValue) {
			target.dayOfWeek = 0;
		} else {
			target.dayOfWeek = dayValue; // 直接覆盖为包含单值的数组
		}
	};

	// 内部处理：开始日期变动时联动校验
	const handleStartDateChange = (index: number, e: any) => {
		const item = form.value.schedules[index];
		item.startDate = e.detail.value;
		if (item.endDate && item.endDate < item.startDate) {
			item.endDate = ""; // 结束日期比开始日期还早则清空
		}
	};

	const toSelectCourse = () => jump(ROUTES.SELECT_COURSE);

	const toSelectTeacher = () => {
		const ids = selectedTeachers.value
			.map((t) => t.teacherId.toString())
			.join(",");
		console.log("即将传输的ids", ids);
		jump(ROUTES.SELECT_TEACHER, ids);
	};

	const removeTeacher = (index: number) =>
		selectedTeachers.value.splice(index, 1);

	// 提交整体表单
	const submitForm = async () => {
		// 基础表单校验
		if (!form.value.className) return showToast("请输入班级名称");
		if (!form.value.courseId) return showToast("请关联课程");

		// 动态日程数组强校验
		if (form.value.schedules.length === 0) {
			return showToast("请至少添加一组上课日程");
		}

		// 教师数组强校验
		if (form.value.teachers.length === 0) {
			return showToast("请至少选择一位班级教师");
		}

		// 循环遍历数组进行逻辑合法性审查
		for (let i = 0; i < form.value.schedules.length; i++) {
			const item = form.value.schedules[i];
			const prefix = `第 ${i + 1} 组时段: `;

			if (item.dayOfWeek === 0) return showToast(`${prefix}请选择上课周期`);
			if (!item.startDate || !item.endDate)
				return showToast(`${prefix}请补全有效日期`);
			if (!item.startTime || !item.endTime)
				return showToast(`${prefix}请补全具体上课时间`);

			// 【核心修改点】使用时间戳严格对比日期先后
			const startDateTime = new Date(item.startDate).getTime();
			const endDateTime = new Date(item.endDate).getTime();

			// 正常情况 A：结束日期直接早于开始日期 -> 必须拦截
			if (endDateTime < startDateTime) {
				return showToast(`${prefix}结束日期不能早于开始日期`);
			}

			if (item.endTime <= item.startTime) {
				return showToast(`${prefix}结束时间必须大于开始时间`);
			}
		}

		// 格式化输出数据交给后端
		console.log("最终提交的完整报文:", JSON.parse(JSON.stringify(form.value)));
		const res = await insertClass(form.value);
		if (res) {
			showToast("班级创建成功");
		} else {
			showToast("班级创建失败");
		}
		uni.navigateBack();
	};

	const showToast = (title: string) => {
		uni.showToast({ title, icon: "none" });
	};
</script>

<style lang="scss" scoped src="./index.scss"></style>
