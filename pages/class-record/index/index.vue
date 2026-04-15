<template>
	<view class="content">
		<!-- 页面上半部分 -->
		<view class="top">
			<!-- 搜索栏 -->
			<view class="search-bar-line">
				<uni-search-bar
					v-model="searchText"
					placeholder="请输入搜索内容(姓名、课程名称、备注)"
					clearable
					cancelButton="false"
					@search="handleSearch"
					@confirm="handleSearch"
					class="search-bar"
					radius="50"
				>
				</uni-search-bar>
			</view>
			<!-- 数据视图切换 -->
			<view class="data-tabs">
				<view
					class="tab-item"
					v-for="(item, index) in dataTabsList"
					:key="index"
					@click="handleTabClick(index)"
					:class="{ active: currentTabIndex === index }"
				>
					<view class="tab-text">{{ item.name }}</view>
				</view>
			</view>
		</view>

		<!-- 页面下半部分 -->
		<scroll-view scroll-y class="bottom" enable-flex="true">
			<view v-if="dataList.length > 0" class="data-card-container">
				<uni-card v-for="item in dataList" :key="item.id" class="data-card">
					<view>
						<slot name="title" class="title">
							<div class="card-title">
								<div class="card-title-left" @click="handleClick(item)">
									<uni-icons
										type="person-filled"
										size="30"
										color="#92dcd3"
									></uni-icons>
									<div class="name">{{ item.stuName }}</div>
									<div class="status">
										{{ item.courseStatus === 1 ? "" : "已完成" }}
									</div>
								</div>
								<div class="card-title-right">
									<uni-icons
										type="more"
										size="30"
										color="#92dcd3"
										class="more-icon"
										@click.stop="handleMore(item)"
									></uni-icons>
								</div>
							</div>
						</slot>
						<div
							v-for="(value, key) in DATA_INDEX_MAP"
							:key="key"
							class="card-content"
							@click="handleClick(item)"
						>
							{{ value }}：{{ item[key] === null ? "无记录" : item[key] }}
						</div>
						<button
							class="button admin-btn"
							@click="jump('/pages/classRecord/adjust/index', item)"
							v-if="item.permissionType === 1"
						>
							<uni-icons
								type="compose"
								size="16"
								color="$theme-color"
								class="btn-icon"
							></uni-icons>
							计课时
						</button>
					</view>
				</uni-card>
				<uni-load-more :status="loadStatus" />
			</view>
			<view v-else>
				<view class="no-data">
					<span class="no-data-text">暂无数据</span>
				</view>
			</view>
		</scroll-view>
		<view class="fab" @click="jump('/pages/classRecord/addCourse/index')">
			<uni-icons type="plusempty" size="30" color="#fff"></uni-icons>
		</view>
	</view>
</template>

<script setup lang="ts">
	import type {
		CourseRecordList,
		GetCourseRecordResponse,
		GetCourseRecordForm,
	} from ".";
	import {
		onLoad,
		onReachBottom,
		onPullDownRefresh,
		onShow,
	} from "@dcloudio/uni-app";
	import { ref } from "vue";
	import { jump } from "@/utils/common";
	import { loginNoPwd } from "@/api/auth";
	import { post } from "@/utils/request";
	import { DATA_INDEX_MAP } from "@/config/common";

	// 响应式数据（替代原 data 中的内容）
	const searchText = ref("");

	// 1. 声明当前选中的索引（tab默认选中第一个）
	const currentTabIndex = ref(0);
	const selectData = ref({});
	const dataMenuList = ref([
		{
			name: "编辑",
		},
		{
			name: "删除",
		},
	]);
	const dataTabsList = ref([
		{
			name: "全部",
		},
		{
			name: "学习中",
			status: 1,
		},
		{
			name: "已完成",
			status: 2,
		},
	]);
	const dataList = ref<CourseRecordList>([]);
	const queryDataForm = ref<GetCourseRecordForm>({
		stuName: "",
		courseName: "",
		courseRemark: "",
		courseStatus: null,
		currentPage: 1,
		pageSize: 7,
	});

	const total = ref(0);

	// 定义加载状态
	const loadStatus = ref("more"); // more, loading, noMore

	// 获取数据方法 (核心修改)
	const getData = (isRefresh = false) => {
		console.log("当前页:", queryDataForm.value.currentPage);

		if (isRefresh) {
			queryDataForm.value.currentPage = 1;
			loadStatus.value = "loading";
		}

		post<GetCourseRecordResponse>("/course_record/get", {
			...queryDataForm.value,
		})
			.then((res) => {
				console.log("获取数据响应:", res);
				// 假设后端返回的数据在 res.data 中，总数在 res.total 中
				total.value = res.data.total || 0;
				const newList = res.data.courseRecords || [];
				if (isRefresh) {
					dataList.value = newList;
					uni.stopPullDownRefresh(); // 停止下拉动画
				} else {
					dataList.value = [...dataList.value, ...newList];
				}

				// 判断是否还有更多数据
				if (newList.length < queryDataForm.value.pageSize) {
					loadStatus.value = "noMore";
				} else {
					loadStatus.value = "more";
				}
			})
			.catch(() => {
				loadStatus.value = "more"; // 发生错误时，允许用户再次尝试
				if (isRefresh) uni.stopPullDownRefresh();
			});
	};

	// 2. 实现下拉刷新
	onPullDownRefresh(() => {
		getData(true);
	});

	// 3. 实现上拉加载
	onReachBottom(() => {
		console.log("dataList.value.length:", dataList.value.length);
		console.log("total.value:", total.value);
		if (dataList.value.length >= total.value) {
			console.log("没有更多数据了");
			loadStatus.value = "noMore";
			return;
		}
		if (loadStatus.value === "noMore" || loadStatus.value === "loading") return;
		queryDataForm.value.currentPage++;
		loadStatus.value = "loading";
		getData(false);
	});

	// 生命周期函数（替代原 onLoad）
	onLoad(() => {
		dataList.value = [];
	});

	onShow(() => {
		dataList.value = [];
		// 在 login.vue 或 App.vue 中
		loginNoPwd();
		// 刷新数据
		getData();
	});

	// 方法定义（替代原 methods 中的内容）
	const handleSearch = () => {
		queryDataForm.value.stuName = searchText.value;
		queryDataForm.value.courseName = searchText.value;
		queryDataForm.value.courseRemark = searchText.value;
		getData(true);
		console.log(searchText.value); // Vue3 响应式数据需通过 .value 访问
	};

	// 2. 切换 Tab 的方法
	const handleTabClick = (index) => {
		currentTabIndex.value = index;
		// 这里可以根据 index 过滤数据或重新请求 getData(true)
		// 例如：queryDataForm.value.status = dataTabsList.value[index].status || null;
		queryDataForm.value.courseStatus = dataTabsList.value[index].status || null;
		console.log("上传数据", queryDataForm.value);

		// 切换标签时回到顶部
		uni.pageScrollTo({
			scrollTop: 0,
			duration: 100,
		});

		getData(true);
	};

	// 处理更多操作
	const handleMore = (item) => {
		selectData.value = item; // 赋值需用 .value
		console.log("点击了更多操作:", item.id);
		uni.showActionSheet({
			itemList: dataMenuList.value.map((item) => item.name),
			success: (res) => {
				switch (res.tapIndex) {
					case 0:
						console.log("编辑");
						jump("/pages/classRecord/edit/edit", item);
						break;
					case 1:
						console.log("删除");
						post("/course_record/delete", {
							courseRecordId: item.id,
						}).then((res) => {
							console.log("删除响应:", res);
							if (res.code === 200) {
								uni.showToast({
									title: "删除成功",
									icon: "success",
								});
								getData(true); // 刷新数据
							} else {
								uni.showToast({
									title: res.message || "删除失败",
									icon: "none",
								});
							}
						});
						break;
					default:
						uni.showToast({
							title: "未知操作",
							icon: "none",
						});
						break;
				}
			},
		});
	};

	const handleClick = (item) => {
		const navItem = {
			data: item,
		};
		jump("/pages/classRecord/detail/detail", navItem);
	};

	// 如果模板中需要使用这些方法，需暴露出去（setup 语法自动暴露，无需 return，仅需确保函数定义在 setup 内）
</script>

<style lang="scss" scoped src="./index.scss"></style>
