<template>
	<view class="container">
		<SearchFilterBar
			v-model:keyword="queryForm.keyword"
			:filters="filterConfig"
			v-model:active-filters="activeFilters"
			placeholder="请输入班级名称"
			@search="handleSearch"
			@filter-change="handleFilterChange"
			class="search-filter-bar"
		/>

		<view class="class-list">
			<view
				class="class-card"
				v-for="(item, index) in classList"
				:key="index"
				hover-class="card-hover-effect"
				hover-stay-time="150"
				@tap="handleCardClick(item)"
				@longpress="handleCardLongPress(item)"
			>
				<view class="card-header">
					<text class="class-name">{{ item.className }}</text>
					<text
						:class="[
							'status-tag',
							item.status === 2 ? 'status-tag-danger' : 'status-tag-success',
						]"
						>{{ item.status === 2 ? "已结束" : "进行中" }}</text
					>
				</view>

				<view class="card-body">
					<view class="info-item">
						<uni-icons type="person" size="16" color="#666"></uni-icons>
						<text class="label">授课教师：</text>
						<text class="value">{{
							item.teachers.map((teacher) => teacher.username).join("、") ||
							"无"
						}}</text>
					</view>
					<view class="info-item">
						<image src="/static/icon/book-3.svg" mode="aspectFit"></image>
						<text class="label">课程名称：</text>
						<text class="value">{{ item.courseName }}</text>
					</view>
				</view>
			</view>

			<view class="empty-state" v-if="classList.length === 0">
				<uni-icons type="search" size="40" color="#ccc"></uni-icons>
				<text>未搜索到相关班级</text>
			</view>
		</view>

		<!-- 新增：右下角悬浮按钮 -->
		<FloatingActionButton @click="goToAddClass" />
	</view>
</template>

<script setup lang="ts">
	import { ref } from "vue";
	import { useUserStore } from "@/stores/user";
	import { getClassList, updateClassById } from "@/api/class";
	import { onLoad, onShow } from "@dcloudio/uni-app";
	import { jump } from "@/utils/common";
	import { ROUTES } from "@/config/routes";

	import SearchFilterBar from "@/components/search-filter-bar/index.vue";
	import FloatingActionButton from "@/components/floating-action-button/index.vue";

	/** 筛选器配置 */
	const filterConfig = ref<FilterType>({
		scope: {
			label: "范围",
			options: [
				{ label: "当前机构", value: 2 },
				{ label: "当前教师", value: 1 },
			],
		},
		classStatus: {
			label: "班级状态",
			options: [
				{ label: "全部", value: -1 },
				{ label: "进行中", value: 1 },
				{ label: "已结束", value: 2 },
			],
		},
	});

	/** 当前激活的筛选条件 */
	const activeFilters = ref<ActiveFiltersType>({
		scope: 2,
		classStatus: -1,
	});

	const userStore = useUserStore();

	const classList = ref<ClassResponse[]>([]);

	const queryForm = ref<GetClassListRequest>({
		scope: 0,
		classStatus: -1,
		targetId: 0,
		keyword: "",
	});

	// 页面加载时获取班级列表
	onLoad(async () => {});

	onShow(async () => {
		const teacherId =
			userStore.userInfo?.roleId === 4
				? userStore.userInfo?.identityInfo.teacherId
				: null;
		console.log("teacherId", teacherId);
		if (teacherId) {
			queryForm.value = {
				scope: activeFilters.value.scope,
				classStatus: activeFilters.value.classStatus,
				targetId: teacherId,
				keyword: queryForm.value.keyword,
			};
			loadData();
		}
	});

	/** 处理搜索关键词变更 */
	const handleSearch = async () => {
		console.log("搜索关键字：", queryForm.value.keyword);
		// 如果是后端搜索，这里可以发起网络请求
		queryForm.value.keyword = queryForm.value.keyword || "";
		loadData();
	};

	/** 加载班级列表数据 */
	const loadData = async () => {
		const res = await getClassList({
			scope: activeFilters.value.scope,
			classStatus: activeFilters.value.classStatus,
			targetId: queryForm.value.targetId,
			keyword: queryForm.value.keyword,
		});
		classList.value = res.classList || [];
	};

	/** 点击班级卡片，跳转到班级详情 */
	const handleCardClick = (item: ClassResponse) => {
		console.log("点击了班级:", item.className);
		jump(ROUTES.CLASS_DETAIL, item);
	};

	/** 长按班级卡片，弹出删除确认 */
	const handleCardLongPress = (item: ClassResponse) => {
		// 触发震动反馈（增强手感，仅 App/小程序支持）
		uni.vibrateShort();

		uni.showActionSheet({
			itemList: [
				"编辑班级",
				item.status === 1 ? "结束班级" : "重启班级",
				"删除班级",
			],
			itemColor: "#333",
			success: (res) => {
				switch (res.tapIndex) {
					case 0:
						console.log("点击编辑");
						jump(ROUTES.EDIT_CLASS_INFO, item, "navigate", true);
						break;
					case 1:
						console.log("点击结束班级");
						// 执行结束班级逻辑
						adjustClassStatus(item, item.status === 1 ? 2 : 1);
						break;
					case 2:
						handleDeleteClass(item);
						break;
				}
			},
		});
	};

	/** 删除班级 */
	const handleDeleteClass = (item: ClassResponse) => {
		uni.showModal({
			title: "确认删除",
			content: `确定要删除班级【${item.className}】吗？`,
			confirmColor: "#ff5252",
			success: (res) => {
				if (res.confirm) {
					console.log("执行删除接口...");
					// 执行删除逻辑并刷新列表
				}
			},
		});
	};

	/** 处理筛选条件变更 */
	const handleFilterChange = () => {
		loadData();
	};

	/** 切换班级状态（启用/停用） */
	const adjustClassStatus = (item: ClassResponse, status: number) => {
		console.log(
			`调整班级状态为${status === 2 ? "已结课/毕业" : "进行中"}的班级`,
			item.className,
		);
		uni.showModal({
			title: status === 2 ? "确认结束班级" : "确认重启班级",
			content: `确定要${status === 2 ? "结束" : "重启"}班级【${item.className}】吗？`,
			showCancel: true,
			success: ({ confirm, cancel }) => {
				if (confirm) {
					console.log(`执行${status === 2 ? "结束" : "重启"}班级接口...`);
					// 执行结束班级逻辑并刷新列表
					updateClassById({
						classId: item.id,
						onlyUpdateClassOwn: true,
						status: status,
						schedules: undefined,
						teachers: undefined,
					}).then(() => {
						loadData();
					});
				}
			},
		});
		// 执行结束班级逻辑
	};

	/** 跳转到创建班级页面 */
	const goToAddClass = () => {
		jump(ROUTES.ADD_CLASS);
	};
</script>

<style scoped lang="scss" src="./index.scss"></style>
