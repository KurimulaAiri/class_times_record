<template>
	<view class="container">
		<!-- 搜索与筛选栏 -->
		<SearchFilterBar
			v-model:keyword="tempKeyword"
			v-model:activeFilters="activeFilters"
			:filters="filterConfig"
			placeholder="搜索班级名称、班主任或年级"
			@search="handleSearch"
			@filterChange="handleFilterChange"
			class="search-filter-bar"
		/>

		<!-- 班级列表区域 -->
		<view class="class-list" :class="{ 'has-footer': isMultiSelect }">
			<view
				v-for="item in classes"
				:key="item.id"
				:class="[
					'class-card',
					item.status === 1 ? 'card-active' : 'card-inactive',
					isItemSelected(item.id) ? 'selected-card' : '',
				]"
				hover-class="card-hover-effect"
				@tap="handleClick(item)"
				@longpress="handleLongPress(item)"
			>
				<!-- 班级头像（用班级简称填充） -->
				<view :class="['avatar', item.status === 1 ? 'active' : 'inactive']">
					{{ formatAvatarText(item.className) }}
				</view>

				<!-- 班级核心信息 -->
				<view class="content">
					<view class="top-row">
						<text class="name">{{ item.className }}</text>
						<text class="status-tag">{{
							item.status === 1 ? "进行中" : "已结束"
						}}</text>
					</view>
					<view class="info-text">
						{{ item.id }} - 班主任:
						{{ item.teachers.map((t) => t.username).join("、") || "未分配" }}
					</view>
					<view class="sub-info-text">
						学生总数: {{ item.studentCount || 0 }} 人
					</view>
				</view>

				<!-- 右侧动作区域：多选框或单选箭头 -->
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
					<text v-else class="arrow-icon">▶</text>
				</view>
			</view>

			<!-- 加载状态提示 -->
			<view class="load-status" v-if="classes.length > 0">
				<view v-if="isLoading" class="loading-text">加载中...</view>
				<view v-else-if="isFinished" class="finished">已经到底啦</view>
				<view v-else-if="classes.length > 0" class="more-text"
					>下拉加载更多</view
				>
			</view>

			<!-- 多选模式下的底部确认栏 -->
			<PageFooter
				v-if="selectedList.length > 0"
				info="已选 {{count}} 个班级"
				:count="selectedList.length"
				:buttons="[{ text: '确认选择', type: 'primary', disabled: selectedList.length === 0 }]"
				@btnClick="handleMultiConfirm"
			></PageFooter>

			<!-- 空状态 -->
			<view v-if="classes.length === 0 && !isLoading" class="empty">
				<view class="empty-icon">🏫</view>
				<text class="empty-text">未找到相关班级</text>
				<text class="empty-tips">可以尝试换个关键词或筛选条件</text>
			</view>
		</view>

		<!-- 右下角悬浮添加班级按钮 -->
		<view
			class="fab-btn"
			hover-class="fab-btn-active"
			@tap="goToAddClass"
			v-if="selectedList.length === 0"
		>
			<text class="plus-icon">+</text>
		</view>
	</view>
</template>

<script setup lang="ts">
	import { ref, toRaw } from "vue";
	import { useUserStore } from "@/stores/user";
	import PageFooter from "@/components/page-footer/index.vue";
	import {
		onLoad,
		onReachBottom,
		onPullDownRefresh,
		onShow,
	} from "@dcloudio/uni-app";
	import { jump, parseData } from "@/utils/common/index";
	import { ROUTES } from "@/config/routes";
	import SearchFilterBar from "@/components/search-filter-bar/index.vue";
	import { getClassList } from "@/api/class";

	const userStore = useUserStore();
	let teacherId = ref(0);
	let institutionId = ref(0);

	if (userStore.userInfo?.roleId === 4) {
		teacherId.value = userStore.userInfo.identityInfo.teacherId;
		institutionId.value = userStore.userInfo.identityInfo.institutionId;
	}

	// --- 分页与数据状态 ---
	const classes = ref<ClassResponse[]>([]);
	const currentClass = ref<ClassResponse | null>(null);
	const currentPage = ref(1);
	const pageSize = 10;
	const isFinished = ref(false);
	const isLoading = ref(false);
	const isMultiSelect = ref(false);

	// --- 多选状态 ---
	const selectedList = ref<ClassResponse[]>([]);

	const tempKeyword = ref("");
	const searchKeyword = ref("");

	// 针对班级的筛选配置
	const filterConfig = ref({
		scope: {
			label: "范围",
			options: [
				{ label: "当前老师", value: 1 },
				{ label: "当前机构", value: 2 },
			],
		},
		status: {
			label: "状态",
			options: [
				{ label: "状态不限", value: -1 },
				{ label: "进行中", value: 1 },
				{ label: "已结课/毕业", value: 0 },
			],
		},
	});

	/** 当前激活的筛选条件 */
	const activeFilters = ref({
		scope: 1,
		status: 1,
	});
/** 处理筛选条件变更 */
	
	const handleFilterChange = () => {
		loadData(true);
	};

	/** 加载班级列表数据 */
	const loadData = async (reset = false) => {
		if (isLoading.value) return;
		if (reset) {
			currentPage.value = 1;
			isFinished.value = false;
		}
		if (isFinished.value) return;

		isLoading.value = true;
		try {
			// 这里替换为你真实的获取班级 API，如 getClassList({...})
			// 为了保证能看清逻辑，此处模拟了 2 条返回数据
			const res: ClassListResponse = await getClassList({
				scope: activeFilters.value.scope,
				targetId:
					activeFilters.value.scope === 1
						? teacherId.value
						: institutionId.value,
				keyword: searchKeyword.value,
			});

			const classList = res.classList;

			setTimeout(() => {
				if (classList && classList.length > 0) {
					if (reset) {
						classes.value = classList;
					} else {
						classes.value = [...classes.value, ...classList];
					}
					isFinished.value = true; // 模拟直接到底
				} else {
					if (reset) classes.value = [];
					isFinished.value = true;
				}
				isLoading.value = false;
				uni.stopPullDownRefresh();
			}, 300);
		} catch (error) {
			console.error("加载班级失败", error);
			isLoading.value = false;
			uni.stopPullDownRefresh();
		}
	};

	/** 判断班级是否已被选中 */
	const isItemSelected = (id: number) => {
		return selectedList.value.some((c) => c.id === id);
	};

	// --- 生命周期 ---
	onShow(() => {
		loadData(true);
	});

	onLoad((options) => {
		if (options && options.data) {
			isMultiSelect.value = parseData<any>(options.data)?.type === "multi";
		}
		loadData(true);
	});

	onPullDownRefresh(() => {
		loadData(true);
	});

	onReachBottom(() => {
		loadData();
	});

	const goToAddClass = () => {
		// 对应你的路由配置或直接跳转
		jump(ROUTES.ADD_CLASS);
	};

	const handleSearch = () => {
		searchKeyword.value = tempKeyword.value.trim();
		loadData(true);
	};

	/** 点击班级卡片 */
	const handleClick = (item: ClassResponse) => {
		if (isMultiSelect.value) {
			const index = selectedList.value.findIndex((c) => c.id === item.id);
			if (index > -1) {
				selectedList.value.splice(index, 1);
			} else {
				selectedList.value.push(item);
			}
		} else {
			// 单选直接向上抛出事件并返回
			uni.$emit("updateClass", item);
			uni.navigateBack();
		}
	};

	/** 长按班级卡片，弹出删除确认 */
	const handleLongPress = (item: ClassResponse) => {
		uni.vibrateShort();
		uni.showActionSheet({
			itemList: ["编辑班级信息"],
			itemColor: "#333",
			success: (res) => {
				if (res.tapIndex === 0) {
					currentClass.value = item;
				}
			},
		});
	};

	// 多选确认
	const handleMultiConfirm = () => {
		if (selectedList.value.length === 0) return;
		uni.$emit("updateClasses", toRaw(selectedList.value));
		uni.navigateBack();
	};

	/** 格式化头像文字（取姓名首字） */
	const formatAvatarText = (name: string) => {
		if (!name) return "";
		return name.length > 2 ? name.substring(name.length - 2) : name;
	};
</script>

<style lang="scss" src="./index.scss"></style>
