<template>
	<view class="container">
		<!-- 固定头部容器 -->
		<view class="fixed-header">
			<!-- 搜索框 -->
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

			<!-- 下拉筛选 -->
			<view class="filter-bar">
				<view
					v-for="(label, type) in filterLabels"
					:key="type"
					class="tab-item"
					:class="{ active: currentSelectType === type }"
					@tap="toggleDropdown(type)"
				>
					<text>{{ getLabel(type) }}</text>
					<text class="arrow" :class="{ rotate: currentSelectType === type }"
						>▼</text
					>
				</view>
			</view>

			<!-- 下拉选项内容 (绝对定位在 fixed-header 内部) -->
			<view class="dropdown-content" :class="{ show: currentSelectType }">
				<view
					v-for="opt in currentOptions"
					:key="opt.value"
					class="option-item"
					:class="{ selected: activeFilters[currentSelectType] === opt.value }"
					@tap="handleSelect(opt.value)"
				>
					<text>{{ opt.label }}</text>
					<icon
						v-if="activeFilters[currentSelectType] === opt.value"
						type="success_no_circle"
						size="14"
						color="#70a9a2"
					/>
				</view>
			</view>
		</view>

		<!-- 遮罩层 (放在固定头部之外，覆盖全屏) -->
		<view
			class="dropdown-mask"
			v-if="currentSelectType"
			@tap="currentSelectType = ''"
		></view>

		<view class="student-list" :class="{ 'has-footer': isMultiSelect }">
			<view
				v-for="item in students"
				:key="item.id"
				:class="[
					'student-card',
					item.sex === 1 ? 'card-male' : 'card-female',
					isItemSelected(item.id) ? 'selected-card' : '',
				]"
				hover-class="card-hover-effect"
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

				<!-- 右侧图标切换逻辑 -->
				<view class="action-area">
					<block v-if="isMultiSelect">
						<view class="checkbox-wrapper">
							<view
								:class="[
									'custom-checkbox',
									isItemSelected(item.id) ? 'checked' : '',
								]"
							>
								<icon
									v-if="isItemSelected(item.id)"
									type="success_no_circle"
									size="12"
									color="#fff"
								/>
							</view>
						</view>
					</block>
					<!-- 装饰性箭头 -->

					<text v-else class="arrow-icon">▶</text>
				</view>
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

			<!-- 多选模式下的底部确认栏 -->
			<view v-if="selectedList.length > 0" class="multi-footer">
				<view class="footer-info">
					已选 <text class="count">{{ selectedList.length }}</text> 人
				</view>
				<button
					class="confirm-btn"
					:disabled="selectedList.length === 0"
					@tap="handleMultiConfirm"
				>
					确认选择
				</button>
			</view>

			<view v-if="students.length === 0 && !isLoading" class="empty">
				<view class="empty-icon">🔍</view>
				<text class="empty-text">未找到相关学生</text>
				<text class="empty-tips">可以尝试换个姓名或学号搜索</text>
			</view>
		</view>
		<!-- 新增：右下角悬浮按钮 -->
		<view class="fab-btn" hover-class="fab-btn-active" @tap="goToAddStudent" v-if="selectedList.length === 0">
			<text class="plus-icon">+</text>
		</view>
	</view>
</template>

<script setup lang="ts">
	import { ref, computed, toRaw } from "vue";
	import { getStudent } from "@/api/student";
	import { useUserStore } from "@/stores/user";
	import { useStudentStore } from "@/stores/student";
	import {
		onLoad,
		onReachBottom,
		onPullDownRefresh,
		onShow,
	} from "@dcloudio/uni-app";
	import { jump, parseData } from "@/utils/common/index";
	import { ROUTES } from "@/config/routes";

	const userStore = useUserStore();
	let teacherId = ref(0);
	let institutionId = ref(0);

	if (userStore.userInfo?.roleId === 4) {
		teacherId.value = userStore.userInfo.identityInfo.teacherId;
		institutionId.value = userStore.userInfo.identityInfo.institutionId;
	}

	// --- 分页与状态变量 ---
	const students = ref<Student[]>([]);
	const currentStudent = ref<Student | null>(null);
	const currentPage = ref(1);
	const pageSize = 10;
	const isFinished = ref(false); // 是否加载完全部
	const isLoading = ref(false); // 防抖锁：是否正在请求中
	const isMultiSelect = ref(false);

	// --- 新增：多选列表状态 ---
	const selectedList = ref<Student[]>([]);

	const tempKeyword = ref("");
	const searchKeyword = ref("");

	// --- 新增：筛选状态 ---
	const filterOptions = {
		scope: [
			{ label: "当前教师", value: 1 },
			{ label: "当前机构", value: 2 },
		],
		gender: [
			{ label: "性别不限", value: -1 },
			{ label: "男", value: 1 },
			{ label: "女", value: 0 },
		],
		classStatus: [
			{ label: "班级不限", value: -1 },
			{ label: "已分班", value: 1 },
			{ label: "未分班", value: 0 },
		],
	};

	const filterLabels = {
		scope: "范围",
		gender: "性别",
		classStatus: "班级",
	};

	// ... 保持之前的 currentSelectType, currentOptions, handleSelect 等逻辑不变 ...

	const activeFilters = ref({
		scope: 1, // 默认当前教师
		gender: -1,
		classStatus: -1,
	});

	// 当前正在展开的下拉类型：'scope' | 'gender' | 'classStatus' | ''
	const currentSelectType = ref("");

	// 计算属性：根据当前点击的 Tab 获取对应的选项列表
	const currentOptions = computed(() => {
		if (!currentSelectType.value) return [];
		return filterOptions[currentSelectType.value as keyof typeof filterOptions];
	});

	// 切换下拉框显示/隐藏
	const toggleDropdown = (type: string) => {
		currentSelectType.value = currentSelectType.value === type ? "" : type;
	};

	// 选择选项
	const handleSelect = (value: number) => {
		const type = currentSelectType.value;
		if (type) {
			(activeFilters.value as any)[type] = value;
			currentSelectType.value = ""; // 选择后自动收起
			loadData(true); // 重新加载数据
		}
	};

	// 获取显示的文字（带兜底防止 TS 报错）
	const getLabel = (type: keyof typeof filterOptions) => {
		const val = activeFilters.value[type];
		return filterOptions[type].find((i) => i.value === val)?.label || "请选择";
	};

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
			const res = await getStudent({
				targetId:
					activeFilters.value.scope === 1
						? teacherId.value
						: institutionId.value,
				currentPage: currentPage.value,
				pageSize: pageSize,
				// 如果后端支持搜索字段，建议直接传给后端分页处理
				keyword: searchKeyword.value,
				// --- 新增：传给后端的筛选参数 ---
				scope: activeFilters.value.scope,
				sex: activeFilters.value.gender,
				hasClass:
					activeFilters.value.classStatus === 0
						? null
						: activeFilters.value.classStatus === 1,
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

	// 判断当前 ID 是否被选中
	const isItemSelected = (id: number) => {
		return selectedList.value.some((s) => s.id === id);
	};

	// --- 生命周期钩子 ---
	onShow(() => {
		loadData(true);
	});

	// 初始化加载
	onLoad((options) => {
		if (options) {
			isMultiSelect.value = parseData<ToSelectStudentPageParams>(options.data)?.type === "multi";
		}
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

	// 1. 在 config/routes 中确保有 ADD_STUDENT
	// 2. 增加跳转方法
	const goToAddStudent = () => {
		// 假设你的路由配置文件里定义了 ADD_STUDENT
		jump(ROUTES.ADD_STUDENT);
		// 或者直接使用 uni.navigateTo({ url: '/pages/student/add' })
	};

	// --- 搜索逻辑 ---
	const handleSearch = () => {
		searchKeyword.value = tempKeyword.value.trim();
		// 搜索通常需要重置列表并从第一页开始查
		loadData(true);
	};

	// 重写点击逻辑
	const handleClick = (item: Student) => {
		if (isMultiSelect.value) {
			// 多选模式：切换选中状态
			const index = selectedList.value.findIndex((s) => s.id === item.id);
			if (index > -1) {
				selectedList.value.splice(index, 1);
			} else {
				selectedList.value.push(item);
			}
		} else {
			// 单选模式：原逻辑
			uni.$emit("updateStudent", item);
			uni.navigateBack();
		}
	};

	// 处理长按反馈
	const handleLongPress = (item: Student) => {
		// 震动反馈
		uni.vibrateShort();

		uni.showActionSheet({
			itemList: ["编辑学生信息"],
			itemColor: "#333",
			success: (res) => {
				if (res.tapIndex === 0) {
					// 点击记录当前选中的学员
					currentStudent.value = item;
					// 点击记录当前选中的学员到store
					const studentStore = useStudentStore();
					studentStore.setStudentInfo(item);
					// 编辑
					jump(ROUTES.EDIT_STUDENT_INFO_TEACHER);
				}
			},
		});
	};

	// 多选确认提交
	const handleMultiConfirm = () => {
		if (selectedList.value.length === 0) return;

		// 发送完整数组回上一页
		uni.$emit("updateStudents", toRaw(selectedList.value));
		uni.navigateBack();
	};

	const formatAvatarText = (name: string) => {
		if (!name) return "";
		return name.length > 2 ? name.substring(name.length - 2) : name;
	};
</script>

<style lang="scss" src="./index.scss"></style>
