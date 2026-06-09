<template>
	<view class="container">
		<view class="header-bg">
			<view class="class-info">
				<text class="class-title">{{
					classInfo?.className || "排课详情"
				}}</text>
				<view
					:class="[
						'status-badge',
						classInfo?.status === 0
							? 'status-badge-danger'
							: 'status-badge-success',
					]"
					>{{ classInfo?.status === 0 ? "已结束" : "进行中" }}</view
				>
			</view>
		</view>

		<view class="summary-card">
			<view class="info-grid">
				<view class="info-item">
					<text class="label">授课教师</text>
					<text class="value">{{
						classInfo?.teachers.map((teacher) => teacher.username).join("、") ||
						"无"
					}}</text>
				</view>
				<view class="info-item">
					<text class="label">课程名称</text>
					<text class="value">{{ classInfo?.courseName || "无" }}</text>
				</view>
			</view>
		</view>

		<FormPage
			:groups="groups"
			v-model:model-value="currentSlot"
			mode="display"
		></FormPage>

		<PageFooter
			:buttons="[
				{ text: '编辑排课', type: 'secondary' },
				{ text: '删除排课', type: 'danger' },
			]"
			@btn-click="handleFooterClick"
		/>
	</view>
</template>

<script setup lang="ts">
	import { ref, computed, onUnmounted } from "vue";
	import { usePageData, showToast, jump } from "@/utils/common";
	import { getClassByClassId } from "@/api/class";
	import { getClassScheduleById } from "@/api/class-schedule";
	import FormPage from "@/components/form-page/index.vue";
	import PageFooter from "@/components/page-footer/index.vue";
	import { ROUTES } from "@/config/routes";

	const classInfo = ref<ClassResponse>();
	const scheduleDetail = ref<PeriodItem>({} as PeriodItem);

	const currentSlot = computed<ClassScheduleResponse>(() => {
		const slot =
			scheduleDetail.value?.timeSlots?.[0] || ({} as ClassScheduleResponse);
		console.log("当前传给表单的数据对象：", JSON.stringify(slot));
		return slot;
	});

	const groups = computed<FormGroupConfig[]>(() => [
		{
			title: "排课信息",
			mode: "display",
			items: [
				{
					label: "起始日期",
					key: "startDateStr",
					type: "text",
					emptyText: "未设置",
				},
				{
					label: "结束日期",
					key: "endDateStr",
					type: "text",
					emptyText: "未设置",
				},
				{
					label: "上课日",
					key: "dayOfWeek",
					type: "text",
					emptyText: "未设置",
					format: (val: number) => {
						const weekMap: Record<number, string> = {
							1: "周一",
							2: "周二",
							3: "周三",
							4: "周四",
							5: "周五",
							6: "周六",
							7: "周日",
						};
						return weekMap[val] || `周${val}`;
					},
				},
				{
					label: "起始时间",
					key: "startTimeStr",
					type: "text",
					emptyText: "未设置",
				},
				{
					label: "结束时间",
					key: "endTimeStr",
					type: "text",
					emptyText: "未设置",
				},
				{
					label: "备注",
					key: "remark",
					type: "text",
					emptyText: "未填写",
				},
			],
		},
	]);

	usePageData<EditClassScheduleInfoPageTransfer>(async (schedule) => {
		scheduleDetail.value = schedule.data;
		console.log("scheduleDetail.value:", scheduleDetail.value);
		if (schedule.data.timeSlots[0].classId) {
			try {
				const res = await getClassByClassId(schedule.data.timeSlots[0].classId);
				classInfo.value = res.classList?.[0];
			} catch (err) {
				console.error("获取班级信息失败:", err);
			}
		}
	});

	/** 底部按钮点击事件分发 */
	const handleFooterClick = (index: number) => {
		if (index === 0) handleEdit();
		else if (index === 1) handleDelete();
	};

	const handleEdit = () => {
		const s = scheduleDetail.value;
		const periodData: PeriodItem = {
			dateKey: `${s.startDate}_${s.endDate}`,
			startDate: s.startDate,
			endDate: s.endDate,
			remark: s.remark,
			timeSlots: [s.timeSlots[0]],
		};
		jump(
			ROUTES.EDIT_CLASS_SCHEDULE_INFO,
			{
				refreshEventFunctionName: "needRefreshInClassScheduleDetail",
				data: periodData,
			} as EditClassScheduleInfoPageTransfer,
			"navigate",
			true,
		);
	};

	const handleDelete = () => {
		uni.showModal({
			title: "删除确认",
			content: `确定要删除该排课吗？`,
			confirmColor: "#dd524d",
			success: (res) => {
				if (res.confirm) {
					showToast({ msg: "删除成功", icon: "success" });
					setTimeout(() => {
						uni.$emit("needRefreshInClassScheduleDetail");
						uni.navigateBack();
					}, 1500);
				}
			},
		});
	};

	uni.$on("needRefreshInClassScheduleDetail", async () => {
		console.log("needRefreshInClassScheduleDetail in class-schedule-detail");
		try {
			const res = await getClassScheduleById({
				id: scheduleDetail.value.timeSlots?.[0]?.id, // 加上可选链，更安全
			});

			// 直接重构或整体赋值给 scheduleDetail
			scheduleDetail.value = {
				...scheduleDetail.value,
				timeSlots: [res], // 整体替换整个 timeSlots 数组
			};
		} catch (err) {
			console.error("获取排课详情失败:", err);
		}
		uni.$emit("needRefresh");
	});

	onUnmounted(() => {
		uni.$off("needRefresh");
	});
</script>

<style scoped lang="scss" src="./index.scss"></style>
