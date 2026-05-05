<template>
	<view class="container">
		<!-- 1. 顶部固定搜索框 -->
		<view class="search-sticky">
			<view class="search-bar">
				<uni-icons type="search" size="18" color="#999"></uni-icons>
				<input
					class="search-input"
					v-model="searchKeyword"
					placeholder="搜索课程名称"
					@confirm="onSearch"
				/>
			</view>
		</view>

		<!-- 2. 课程卡片列表 -->
		<view class="card-list">
			<view class="card" v-for="(item, index) in dataList" :key="index">
				<view class="card-header">
					<text class="course-name">{{ item.courseName }}</text>
					<view
						class="status-tag"
						:class="{ warning: item.courseRestTime < 3 }"
					>
						剩余 {{ item.courseRestTime }} 次
					</view>
				</view>

				<view class="card-body">
					<view class="info-row">
						<text class="label">课程总次：</text>
						<text class="value">{{ item.courseTotalTime }} 次</text>
					</view>
					<view class="info-row">
						<text class="label">最后上课：</text>
						<text class="value">{{
							item.courseLastTimeStr || "暂无记录"
						}}</text>
					</view>
					<view class="info-row remark" v-if="item.courseRemark">
						<text class="label">备注：</text>
						<text class="value">{{ item.courseRemark }}</text>
					</view>
				</view>
			</view>

			<!-- 3. 加载状态 -->
			<view class="load-more">
				<text>{{
					loading ? "加载中..." : noMore ? "没有更多了" : "上划加载更多"
				}}</text>
			</view>
		</view>
	</view>
</template>

<script setup>
	import { ref, onMounted } from "vue";
	import { onPullDownRefresh, onReachBottom } from "@dcloudio/uni-app"; // 如果是 vue3 写法
	import { getCourseRecordList } from "@/api/course-record";
	import { useStudentStore } from "@/stores/student";

	const searchKeyword = ref("");
	const dataList = ref([]);
	const page = ref(1);
	const loading = ref(false);
	const noMore = ref(false);

	const studentStore = useStudentStore();

	// 模拟 API 请求
	const fetchList = async (pageNum) => {
		if (loading.value) return;
		loading.value = true;

		const res = await getCourseRecordList({
			studentId: studentStore.studentInfo.id,
			stuName: searchKeyword.value,
			courseName: searchKeyword.value,
			courseRemark: "",
			courseStatus: null,
			currentPage: pageNum,
			pageSize: 7,
		});

		console.log("获取课程记录列表", res);

		return res;

		// return new Promise((resolve) => {
		// 	setTimeout(() => {
		// 		const mockData = Array.from({ length: 10 }).map((_, i) => ({
		// 			courseName: `进阶少儿编程课 - ${pageNum}-${i}`,
		// 			courseTotalTime: 48,
		// 			courseRestTime: Math.floor(Math.random() * 20),
		// 			courseLastTimeStr: "2023-10-25 14:30",
		// 			courseRemark: "孩子表现很好，逻辑思维能力有提升。",
		// 		}));
		// 		resolve(mockData);
		// 	}, 800);
		// });
	};

	const loadData = async (refresh = false) => {
		if (refresh) {
			page.value = 1;
			noMore.value = false;
		}

		const res = await fetchList(page.value);
		loading.value = false;

		if (refresh) {
			dataList.value = res;
			uni.stopPullDownRefresh();
		} else {
			dataList.value = [...dataList.value, ...res];
		}

		if (res.length < 10) noMore.value = true;
	};

	// 监听下拉刷新
	onPullDownRefresh(() => {
		console.log("下拉刷新");
		loadData(true);
	});

	// 监听触底加载
	onReachBottom(() => {
		if (!noMore.value) {
			page.value++;
			loadData();
		}
	});

	const onSearch = () => {
		loadData(true);
	};

	onMounted(() => {
		loadData(true);
	});
</script>

<style lang="scss" scoped src="./index.scss"></style>
