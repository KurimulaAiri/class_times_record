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
							item.status === 0 ? 'status-tag-danger' : 'status-tag-success',
						]"
						>{{ item.status === 0 ? "已结束" : "进行中" }}</text
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

	const filterConfig = ref<FilterType>({
		scope: {
			label: "范围",
			options: [
				{ label: "当前机构", value: 2 },
				{ label: "当前教师", value: 1 },
			],
		},
	});

	const activeFilters = ref<ActiveFiltersType>({
		scope: 2,
	});

	const userStore = useUserStore();

	const classList = ref<ClassResponse[]>([]);

	const queryForm = ref<GetClassListRequest>({
		scope: 0,
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
				targetId: teacherId,
				keyword: queryForm.value.keyword,
			};
			loadData();
		}
	});

	const handleSearch = async () => {
		console.log("搜索关键字：", queryForm.value.keyword);
		// 如果是后端搜索，这里可以发起网络请求
		queryForm.value.keyword = queryForm.value.keyword || "";
		loadData();
	};

	const loadData = async () => {
		const res = await getClassList({
			scope: activeFilters.value.scope,
			targetId: queryForm.value.targetId,
			keyword: queryForm.value.keyword,
		});
		classList.value = res.classList || [];
	};

	// 处理点击事件（通常跳转到班级详情）
	const handleCardClick = (item: ClassResponse) => {
		console.log("点击了班级:", item.className);
		jump(ROUTES.CLASS_DETAIL, item);
	};

	// 处理长按事件
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
						adjustClassStatus(item, item.status === 1 ? 0 : 1);
						break;
					case 2:
						handleDeleteClass(item);
						break;
				}
			},
		});
	};

	// 模拟删除逻辑
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

	// 处理筛选变化
	const handleFilterChange = () => {
		loadData();
	};

	// 模拟结束课程逻辑
	const adjustClassStatus = (item: ClassResponse, status: number) => {
		console.log(
			`调整班级状态为${status === 0 ? "已结课/毕业" : "进行中"}的班级`,
			item.className,
		);
		uni.showModal({
			title: status === 0 ? "确认结束班级" : "确认重启班级",
			content: `确定要${status === 0 ? "结束" : "重启"}班级【${item.className}】吗？`,
			showCancel: true,
			success: ({ confirm, cancel }) => {
				if (confirm) {
					console.log(`执行${status === 0 ? "结束" : "重启"}班级接口...`);
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

	// 新增：点击添加班级按钮
	const goToAddClass = () => {
		jump(ROUTES.ADD_CLASS);
	};
</script>

<style scoped lang="scss" src="./index.scss"></style>
