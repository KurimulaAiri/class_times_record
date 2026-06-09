<template>
	<view class="container">
		<SearchFilterBar class="search-filter-bar"></SearchFilterBar>

		<view class="record-list">
			<view
				class="record-card"
				hover-class="card-hover-active"
				:hover-stay-time="100"
				v-for="(item, index) in recordList"
				:key="item.id || index"
				@tap="handleCardTap(item)"
				@longpress="handleCardLongPress(item)"
			>
				<view class="card-header">
					<view class="student-info">
						<text class="student-name">{{
							item.student?.studentName || "未知"
						}}</text>
					</view>
					<text
						:class="[
							'type-tag',
							item.recordType === 1 ? 'tag-add' : 'tag-reduce',
						]"
					>
						{{ item.recordType === 1 ? "增加" : "减少" }}
					</text>
				</view>

				<view class="card-body">
					<view class="info-row">
						<text class="label">扣课课程：</text>
						<text class="value">{{ item.course?.courseName || "未知" }}</text>
					</view>
					<view class="info-row">
						<text class="label">扣课时间：</text>
						<text class="value">{{ item.recordTimeStr || "未知" }}</text>
					</view>
					<view class="info-row">
						<text class="label">备注：</text>
						<text class="value">{{ item.recordRemark || "无" }}</text>
					</view>
					<view class="info-row">
						<text class="label">操作人：</text>
						<text class="value">{{ item.operatorTeacher?.username || "无" }}</text>
					</view>
				</view>

				<view class="card-footer">
					<text class="num-label">课时变化：</text>
					<text
						:class="[
							'num-value',
							item.recordType === 1 ? 'num-add' : 'num-reduce',
						]"
					>
						{{ item.recordType === 1 ? "+" : "-" }}{{ item.recordChange }} 课时
					</text>
				</view>
			</view>

			<view class="load-status" v-if="recordList.length > 0">
				<view v-if="isLoading" class="loading-text">加载中...</view>

				<view v-else-if="isFinished" class="finished">已经到底啦</view>

				<view v-else class="more-text">上拉加载更多</view>
			</view>

			<view
				v-if="recordList.length === 0 && !isLoading"
				class="empty-placeholder"
			>
				<text>暂无扣课记录</text>
			</view>
		</view>
	</view>
</template>

<script setup lang="ts">
	import SearchFilterBar from "@/components/search-filter-bar/index.vue";
	import { ref } from "vue";
	import { getRecordList } from "@/api/record";
	import { useUserStore } from "@/stores/user";
	// 🌟 优化 3：完整引入 uniapp 的页面生命周期钩子
	import {
		onLoad,
		onShow,
		onReachBottom,
		onPullDownRefresh,
	} from "@dcloudio/uni-app";
	import { ROUTES } from "@/config/routes";
	import { jump } from "@/utils/common";

	const userStore = useUserStore();
	const recordList = ref<RecordResponse[]>([]);

	// 🌟 优化 4：对齐学生列表的分页管理与状态机
	const currentPage = ref(1);
	const pageSize = 10;
	const isFinished = ref(false); // 是否加载完全部
	const isLoading = ref(false); // 防抖锁：是否正在请求中

	const handleCardTap = (item: RecordResponse) => {
		console.log("点击了卡片:", item);
		jump(ROUTES.RECORD_DETAIL, item, "navigate", true);
	};

	const handleCardLongPress = (item: RecordResponse) => {
		console.log("长按了卡片:", item);
		uni.vibrateShort({});
		uni.showModal({
			title: "提示",
			content: `是否要撤销 ${item.student?.studentName} 的这条课时记录？`,
			confirmColor: "#ff4d4f",
			success: (res) => {
				if (res.confirm) {
					console.log("用户确认撤销/删除此记录", item.id);
				}
			},
		});
	};

	// 🌟 优化 5：仿照学生页的标准数据请求与合并逻辑
	const loadData = async (reset = false) => {
		if (isLoading.value) return;

		// 触发刷新重置时，清空老状态
		if (reset) {
			currentPage.value = 1;
			isFinished.value = false;
		}

		// 如果已经加载完毕，直接拦截
		if (isFinished.value) return;

		isLoading.value = true;
		try {
			const institutionId =
				userStore.userInfo?.roleId === 4
					? userStore.userInfo?.identityInfo.institutionId
					: 0;

			const res = await getRecordList({
				institutionId,
				currentPage: currentPage.value,
				pageSize: pageSize,
			});

			if (res && res.length > 0) {
				// 如果是重置则覆盖，否则将新数据追加([...旧数据, ...新数据])
				recordList.value = reset ? res : [...recordList.value, ...res];

				if (res.length < pageSize) {
					isFinished.value = true; // 返回的数据不足单页最大条数，说明到底了
				} else {
					currentPage.value++; // 还有更多数据，页码自增 1 准备下次加载
				}
			} else {
				if (reset) recordList.value = [];
				isFinished.value = true;
			}
		} catch (error) {
			console.error("加载扣课记录失败:", error);
		} finally {
			isLoading.value = false;
			// 🌟 核心：通知系统停止当前页面的下拉刷新状态
			uni.stopPullDownRefresh();
		}
	};

	// 🌟 优化 6：遵循学生列表生命周期规范
	onShow(() => {
		// loadData(true); // 每次进入页面，或从下级页面返回时，重置并刷新列表
	});

	onLoad(() => {
		loadData(true); // 初始化加载
	});

	// 3. 监听小程序原生下拉刷新
	onPullDownRefresh(() => {
		loadData(true);
	});

	// 4. 监听小程序原生触底行为 (自动实现懒加载)
	onReachBottom(() => {
		loadData();
	});
</script>

<style scoped lang="scss" src="./index.scss"></style>
