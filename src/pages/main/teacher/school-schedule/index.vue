<template>
	<view class="timetable-container">
		<!-- 1. 顶部周日历选择器（单选某一天 + 切换上下周） -->
		<view class="week-selector-card">
			<!-- 切换周控制器 -->
			<view class="week-controller">
				<view class="arrow-btn" @tap="changeWeek('prev')">
					<text class="arrow-icon">◀</text>
					<text class="btn-txt">上一周</text>
				</view>
				<view class="month-indicator">{{ currentMonthStr }}</view>
				<view class="arrow-btn" @tap="changeWeek('next')">
					<text class="btn-txt">下一周</text>
					<text class="arrow-icon">▶</text>
				</view>
			</view>

			<view class="week-days-row">
				<view
					v-for="(day, index) in currentWeekDays"
					:key="index"
					class="day-box"
					:class="{
						active: selectedDate === day.dateStr,
						is_today: day.isToday,
					}"
					@tap="handleDateSelect(day.dateStr)"
				>
					<text class="week-txt">{{ day.weekLabel }}</text>
					<text class="date-txt">{{ day.dayNum }}</text>
				</view>
			</view>
		</view>

		<!-- 2. 核心课表视图（左侧时间轴，右侧课程格子） -->
		<scroll-view scroll-y class="schedule-scroll">
			<view class="schedule-body">
				<!-- 左侧时间刻度线 (08:00 - 18:00) -->
				<view class="time-axis">
					<view v-for="hour in timeSlots" :key="hour" class="time-node">
						<text class="time-str">{{ hour }}</text>
					</view>
				</view>

				<!-- 右侧课程主舞台 -->
				<view class="course-stage">
					<!-- 背景网格线 -->
					<view
						v-for="hour in timeSlots"
						:key="'grid-' + hour"
						class="grid-line-row"
					></view>

					<!-- 动态生成的课程卡片（绝对定位） -->
					<view
						v-for="clazz in activeWeekClasses"
						:key="clazz.classId"
						class="course-card-item"
						:style="getClassStyle(clazz)"
						@tap="handleClassClick(clazz)"
					>
						<view class="card-inner">
							<text class="course-name">{{ clazz.className }}</text>
							<text class="course-room">{{
								clazz.teachers.map((t) => t.username).join("、")
							}}</text>
							<text class="course-time"
								>{{ clazz.startTimeStr }}-{{ clazz.endTimeStr }}</text
							>
						</view>
					</view>

					<!-- 当天无课的空状态 -->
					<view v-if="activeWeekClasses.length === 0" class="empty-layer">
						<text class="empty-txt">今日暂无排课记录</text>
					</view>
				</view>
			</view>
		</scroll-view>
	</view>
</template>

<script setup lang="ts">
	import { ref, computed } from "vue";
	import dayjs from "dayjs";
	import { onLoad } from "@dcloudio/uni-app";
	import { getClassScheduleByInstitutionId } from "@/api/class-schedule";

	const scheduleRules = ref<ClassSchedule[]>([
		{
			id: 1,
			classId: 1,
			className: "初三一班 - 数学课",
			classroom: "101班",
			teachers: [],
			startDateStr: "2026-03-01",
			endDateStr: "2026-07-01",
			dayOfWeek: 1,
			startTimeStr: "08:30",
			endTimeStr: "10:00",
			color: "rgba(112, 169, 162, 0.15)",
			createTimeStr: "2023-01-01 00:00:00",
			updateTimeStr: "2023-01-01 00:00:00",
		},
		{
			id: 2,
			classId: 2,
			className: "初三二班 - 英语课",
			teachers: [],
			startDateStr: "2026-03-01",
			endDateStr: "2026-07-01",
			classroom: "102班",
			dayOfWeek: 3,
			startTimeStr: "10:30",
			endTimeStr: "12:00",
			color: "rgba(240, 173, 78, 0.15)",
			createTimeStr: "2023-01-01 00:00:00",
			updateTimeStr: "2023-01-01 00:00:00",
		},
		{
			id: 3,
			classId: 3,
			className: "初一三班 - 艺术鉴赏",
			teachers: [],
			startDateStr: "2026-05-01",
			endDateStr: "2026-06-30",
			classroom: "103班",
			dayOfWeek: 3,
			startTimeStr: "14:00",
			endTimeStr: "15:30",
			color: "rgba(91, 192, 222, 0.15)",
			createTimeStr: "2023-01-01 00:00:00",
			updateTimeStr: "2023-01-01 00:00:00",
		},
	]);

	// 日历核心状态
	const selectedDate = ref(dayjs().format("YYYY-MM-DD"));
	const timeSlots = [
		"08:00",
		"09:00",
		"10:00",
		"11:00",
		"12:00",
		"13:00",
		"14:00",
		"15:00",
		"16:00",
		"17:00",
		"18:00",
	];
	const START_HOUR = 8;
	const HOUR_HEIGHT = 70;

	onLoad(() => {
		loadData();
	});

	const loadData = async () => {
		const res = await getClassScheduleByInstitutionId({
			institutionId: 1,
			currentPage: 1,
			pageSize: 1000,
		});
		if (res.length > 0) {
			scheduleRules.value = res;
		}
	};

	// 计算当前选中日期所在周的 7 天数据
	const currentWeekDays = computed(() => {
		const target = dayjs(selectedDate.value);

		let dayOfWeek = target.day();
		let submitDayOfWeek = Number(dayOfWeek);
		if (submitDayOfWeek === 0) submitDayOfWeek = 7;

		const daysToMonday = submitDayOfWeek - 1;
		const startOfWeek = target.subtract(daysToMonday, "day");

		const days: any[] = [];
		const weekLabels = ["一", "二", "三", "四", "五", "六", "日"];

		for (let i = 0; i < 7; i++) {
			const current = startOfWeek.add(i, "day");
			days.push({
				dateStr: current.format("YYYY-MM-DD"),
				dayNum: current.date(),
				weekLabel: weekLabels[i],
				isToday: current.isSame(dayjs(), "day"),
			});
		}
		return days;
	});

	const currentMonthStr = computed(() => {
		return dayjs(selectedDate.value).format("YYYY年MM月");
	});

	const activeWeekClasses = computed(() => {
		const targetDate = selectedDate.value;
		let dayOfWeek = dayjs(targetDate).day();
		let submitDayOfWeek = Number(dayOfWeek);
		if (submitDayOfWeek === 0) submitDayOfWeek = 7;

		return scheduleRules.value.filter((rule) => {
			const inDateRange =
				targetDate >= rule.startDateStr && targetDate <= rule.endDateStr;
			const isCorrectDay = rule.dayOfWeek === submitDayOfWeek;
			return inDateRange && isCorrectDay;
		});
	});

	const getClassStyle = (clazz: ClassSchedule) => {
		const [startH, startM] = clazz.startTimeStr.split(":").map(Number);
		const [endH, endM] = clazz.endTimeStr.split(":").map(Number);
		const startMinutesFromBase = (startH - START_HOUR) * 60 + startM;
		const durationMinutes = (endH - startH) * 60 + (endM - startM);

		const top = (startMinutesFromBase / 60) * HOUR_HEIGHT;
		const height = (durationMinutes / 60) * HOUR_HEIGHT;

		return {
			top: `${top}px`,
			height: `${height}px`,
			backgroundColor: clazz.color || "rgba(112, 169, 162, 0.1)",
		};
	};

	const handleDateSelect = (dateStr: string) => {
		selectedDate.value = dateStr;
	};

	// 💡 新增：翻上/下周的核心切周函数
	const changeWeek = (type: "prev" | "next") => {
		if (type === "prev") {
			// 当前选中日期减去 7 天，自动进入上周的同一天
			selectedDate.value = dayjs(selectedDate.value)
				.subtract(7, "day")
				.format("YYYY-MM-DD");
		} else {
			// 当前选中日期加上 7 天，自动进入下周的同一天
			selectedDate.value = dayjs(selectedDate.value)
				.add(7, "day")
				.format("YYYY-MM-DD");
		}
	};

	const handleClassClick = (clazz: ClassSchedule) => {
		uni.showModal({
			title: clazz.className,
			content: `上课老师：${clazz.teachers.map((t) => t.username).join("、")}\n上课时段：${clazz.startTimeStr} - ${clazz.endTimeStr}`,
			showCancel: false,
		});
	};
</script>

<style lang="scss" scoped src="./index.scss"></style>
