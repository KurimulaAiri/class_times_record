<template>
	<view class="container">
		<view class="header-search">
			<input
				class="search-input"
				type="text"
				v-model="tempKeyword"
				@confirm="handleSearch"
				placeholder="搜索姓名、学号或手机号"
			/>
			<button class="search-btn" @tap="handleSearch">搜索</button>
		</view>

		<view class="student-list">
			<view
				v-for="item in students"
				:key="item.id"
				:class="['student-card', item.sex === 1 ? 'card-male' : 'card-female']"
				@tap="handleClick(item)"
				@longpress="handleLongPress(item)"
			>
				<!-- 头像 -->
				<view :class="['avatar', item.sex === 1 ? 'male' : 'female']">
					{{ formatAvatarText(item.studentName) }}
				</view>

				<!-- 信息 -->
				<view class="content">
					<view class="top-row">
						<text class="name">{{ item.studentName }}</text>
						<text class="gender-tag">{{ item.sex === 1 ? "男" : "女" }}</text>
					</view>
					<view class="info-text">
						{{ item.id
						}}{{
							item.primaryParent === null
								? " - 无主要联系人"
								: " - " +
									`${item.primaryParent?.relation} : ${item.primaryParent?.phone}`
						}}
					</view>
				</view>

				<!-- 装饰性箭头 -->
				<text class="arrow-icon">▶</text>
			</view>
			<view class="load-status" v-if="students.length > 0">
				<!-- 加载中 -->
				<view v-if="isLoading" class="loading-text">加载中...</view>

				<!-- 到底了 -->
				<view v-else-if="isFinished" class="finished">已经到底啦</view>

				<!-- 未触发加载时的提示 -->
				<view v-else-if="students.length > 0" class="more-text"
					>下拉加载更多</view
				>
			</view>

			<view v-if="students.length === 0 && !isLoading" class="empty">
				<view class="empty-icon">🔍</view>
				<text class="empty-text">未找到相关学生</text>
				<text class="empty-tips">可以尝试换个姓名或学号搜索</text>
			</view>
		</view>
	</view>
</template>

<script setup lang="ts">
	import { ref } from "vue";
	import { getStudentListByTeacherId } from "@/api/student";
	import { useUserStore } from "@/stores/user";
	import { useStudentStore } from "@/stores/student";
	import { onLoad, onReachBottom, onPullDownRefresh } from "@dcloudio/uni-app";
	import { Student } from "@/types/student";
	import { jump } from "@/utils/common/index";
	import { ROUTES } from "@/config/routes";

	const userStore = useUserStore();
	let teacherId = ref(0);

	if (userStore.userInfo?.roleId === 4) {
		teacherId.value = userStore.userInfo.identityInfo.teacherId;
	}

	// --- 分页与状态变量 ---
	const students = ref<Student[]>([]);
	const currentStudent = ref<Student | null>(null);
	const currentPage = ref(1);
	const pageSize = 10;
	const isFinished = ref(false); // 是否加载完全部
	const isLoading = ref(false); // 防抖锁：是否正在请求中

	const tempKeyword = ref("");
	const searchKeyword = ref("");

	// --- 核心请求逻辑 ---
	const loadData = async (reset = false) => {
		if (isLoading.value) return; // 正在加载中，跳过
		if (reset) {
			currentPage.value = 1;
			isFinished.value = false;
		}
		if (isFinished.value) return;

		isLoading.value = true;
		try {
			const res = await getStudentListByTeacherId({
				teacherId: teacherId.value,
				currentPage: currentPage.value,
				pageSize: pageSize,
				// 如果后端支持搜索字段，建议直接传给后端分页处理
				keyword: searchKeyword.value,
			});

			if (res && res.length > 0) {
				if (reset) {
					students.value = res;
				} else {
					students.value = [...students.value, ...res];
				}

				// 判断是否还有下一页（根据返回长度是否小于pageSize判断）
				if (res.length < pageSize) {
					isFinished.value = true;
				} else {
					currentPage.value++;
				}
			} else {
				if (reset) students.value = [];
				isFinished.value = true;
			}
		} catch (error) {
			console.error("加载失败", error);
		} finally {
			isLoading.value = false;
			uni.stopPullDownRefresh(); // 停止下拉刷新动画
		}
	};

	// --- 生命周期钩子 ---

	// 初始化加载
	onLoad(() => {
		loadData(true);
	});

	// 1. 下拉刷新
	onPullDownRefresh(() => {
		loadData(true);
	});

	// 2. 触底加载 (懒加载)
	onReachBottom(() => {
		loadData();
	});

	// --- 搜索逻辑 ---
	const handleSearch = () => {
		searchKeyword.value = tempKeyword.value.trim();
		// 搜索通常需要重置列表并从第一页开始查
		loadData(true);
	};

	// --- 点击逻辑 ---
	const handleClick = (item: Student) => {
		console.log("点击学员", item);
		// 点击记录当前选中的学员
		currentStudent.value = item;
		// 点击记录当前选中的学员到store
		const studentStore = useStudentStore();
		studentStore.setStudentInfo(item);
		// 点击跳转学员详情页
		jump(ROUTES.STUDENT_DETAIL);
	};

	// --- 长按逻辑 ---
	const handleLongPress = (item: Student) => {
		// 长按跳转快速扣课页
		// jump(ROUTES.FAST_DEDUCT, { studentId: item.id });
		console.log("长按跳转快速扣课页", item);
	};

	const formatAvatarText = (name: string) => {
		if (!name) return "";
		return name.length > 2 ? name.substring(name.length - 2) : name;
	};
</script>

<style lang="scss" src="./index.scss"></style>
