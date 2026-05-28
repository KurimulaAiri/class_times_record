<template>
	<view class="container">
		<FormPage
			:groups="groups"
			v-model:modelValue="form"
			@picker-tap="onPickerTap"
		>
			<template #group-0-teachers>
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
			</template>
			<template #group-1>
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

						<view class="form-item block-item no-padding-top">
							<text class="label sub-label">上课周期</text>
							<view class="week-days-container">
								<view
									v-for="day in weekOptions"
									:key="day.value"
									:class="[
										'week-tag',
										item.dayOfWeek === day.value && 'active',
									]"
									@tap="toggleWeekDay(index, day.value)"
								>
									{{ day.label }}
								</view>
							</view>
						</view>

						<view class="form-item">
							<text class="label sub-label">有效日期</text>
							<view class="range-picker-box">
								<picker
									mode="date"
									:value="item.startDate"
									@change="handleStartDateChange(index, $event)"
								>
									<view
										:class="['date-text', !item.startDate && 'placeholder']"
									>
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

						<view class="form-item no-border">
							<text class="label sub-label">上课时间</text>
							<view class="range-picker-box">
								<picker
									mode="time"
									:value="item.startTime"
									@change="item.startTime = $event.detail.value"
								>
									<view
										:class="['date-text', !item.startTime && 'placeholder']"
									>
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

				<view class="add-placeholder" @tap="addSchedule">
					<text class="plus-icon">+</text>
					<text>{{
						form.schedules.length > 0 ? "追加一组上课时段" : "添加上课日程时段"
					}}</text>
				</view>
			</template>
		</FormPage>

		<PageFooter
			:buttons="[{ text: '创建班级', type: 'primary' }]"
			@btnClick="submitForm"
		></PageFooter>
	</view>
</template>

<script setup lang="ts">
	import { ref, computed, onUnmounted } from "vue";
	import { onLoad } from "@dcloudio/uni-app";
	import { jump, showToast } from "@/utils/common";
	import { ROUTES } from "@/config/routes";
	import { insertClass } from "@/api/class";
	import FormPage from "@/components/form-page/index.vue";
	import PageFooter from "@/components/page-footer/index.vue";

	/** 星期选项列表 */
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
		teachers: [] as TeacherRequest[],
		schedules: [] as ClassScheduleRequest[],
	});

	/** 表单分组配置 */
	const groups = computed<FormGroupConfig[]>(() => [
		{
			title: "基础信息",
			titleStyle: "dark",
			mode: "edit",
			items: [
				{
					key: "className",
					label: "班级名称",
					type: "input",
					required: true,
					placeholder: "请输入班级名称",
					inputAlign: "right",
				},
				{
					key: "courseId",
					label: "关联课程",
					type: "picker",
					required: true,
					placeholder: "请选择",
					inputAlign: "right",
					pickerText: courseName.value || "请选择",
				},
				{
					key: "maxCount",
					label: "人数上限",
					type: "stepper",
					inputAlign: "right",
					min: 1,
				},
				{
					key: "teachers",
					label: "任课老师",
					type: "slot",
					required: true,
					block: true,
					noBorder: true,
				},
			],
		},
		{
			title: "上课日程安排",
			titleStyle: "dark",
			required: true,
			items: [],
		},
	]);

	const onPickerTap = (key: string) => {
		if (key === "courseId") toSelectCourse();
	};

	/** 添加一组上课日程时段 */
	const addSchedule = () => {
		form.value.schedules.push({
			classId: 0,
			dayOfWeek: 0,
			startDate: "",
			endDate: "",
			startTime: "",
			endTime: "",
		});
	};

	const courseName = ref("");

	/** 已选择的教师列表 */
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
	/** 删除指定索引的上课日程时段 */

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

	const toggleWeekDay = (scheduleIndex: number, dayValue: number) => {
		const target = form.value.schedules[scheduleIndex];

		if (target.dayOfWeek === dayValue) {
			target.dayOfWeek = 0;
		} else {
			target.dayOfWeek = dayValue;
		}
	};

	/** 处理日程开始日期变更，自动设置结束日期 */
	const handleStartDateChange = (index: number, e: any) => {
		const item = form.value.schedules[index];
		item.startDate = e.detail.value;
		if (item.endDate && item.endDate < item.startDate) {
			item.endDate = "";
		}
	};

	const toSelectCourse = () => jump(ROUTES.SELECT_COURSE);

	/** 跳转到教师选择页面 */
	const toSelectTeacher = () => {
		const ids = selectedTeachers.value
			.map((t) => t.teacherId.toString())
			.join(",");
		console.log("即将传输的ids", ids);
		jump(ROUTES.SELECT_TEACHER, ids);
	};

	const removeTeacher = (index: number) =>
		selectedTeachers.value.splice(index, 1);

	/** 提交创建班级表单，校验后调用 insertClass 接口 */
	const submitForm = async () => {
		if (!form.value.className) return showToast("请输入班级名称");
		if (!form.value.courseId) return showToast("请关联课程");

		if (form.value.teachers.length === 0) {
			return showToast("请至少选择一位班级教师");
		}

		if (form.value.schedules.length === 0) {
			return showToast("请至少添加一组上课日程");
		}

		for (let i = 0; i < form.value.schedules.length; i++) {
			const item = form.value.schedules[i];
			const prefix = `第 ${i + 1} 组时段: `;

			if (item.dayOfWeek === 0) return showToast(`${prefix}请选择上课周期`);
			if (!item.startDate || !item.endDate)
				return showToast(`${prefix}请补全有效日期`);
			if (!item.startTime || !item.endTime)
				return showToast(`${prefix}请补全具体上课时间`);

			const startDateTime = new Date(item.startDate).getTime();
			const endDateTime = new Date(item.endDate).getTime();

			if (endDateTime < startDateTime) {
				return showToast(`${prefix}结束日期不能早于开始日期`);
			}

			if (item.endTime <= item.startTime) {
				return showToast(`${prefix}结束时间必须大于开始时间`);
			}
		}

		console.log("最终提交的完整报文:", JSON.parse(JSON.stringify(form.value)));
		const res = await insertClass(form.value);
		if (res) {
			showToast("班级创建成功", "success");
		} else {
			showToast("班级创建失败", "error");
		}
		uni.navigateBack();
	};
</script>

<style lang="scss" scoped src="./index.scss"></style>
