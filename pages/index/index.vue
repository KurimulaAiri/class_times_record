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
								<div
									class="card-title-left"
									@click="handleClick(item, dataDetailMap)"
								>
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
							v-for="(value, key) in dataIndexDetailMap"
							:key="key"
							class="card-content"
							@click="handleClick(item, dataDetailMap)"
						>
							{{ value }}：{{ item[key] === null ? "无记录" : item[key] }}
						</div>
						<button class="button" @click="jump('adjust', item)">计课时</button>
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
		<view class="fab" @click="jump('addCourse')">
			<uni-icons type="plusempty" size="30" color="#fff"></uni-icons>
		</view>
	</view>
</template>

<script setup>
	import {
		onLoad,
		onReachBottom,
		onPullDownRefresh,
		onShow,
	} from "@dcloudio/uni-app";
	import { ref } from "vue";
	import { post, login } from "../../utils/request";

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
	const dataIndexDetailMap = ref({
		stuName: "姓名",
		courseName: "课程名称",
		courseTotalTime: "课程总次数",
		courseRestTime: "课程剩余次数",
		courseLastTimeStr: "最后上课时间",
		courseRemark: "备注",
	});
	const dataDetailMap = ref({
		stuName: "姓名",
		courseName: "课程名称",
		courseTotalTime: "课程总次数",
		courseRestTime: "课程剩余次数",
		courseLastTimeStr: "最后上课时间",
		courseRemark: "备注",
	});
	const dataList = ref([
		/**
		 * 课程记录数据示例
		 *	{
		 *		id: 1,
		 *		name: "张三",
		 *		courseName: "1",
		 *		courseTotalTime: 10,
		 *		courseRestTime: 5,
		 *		courseLastTime: "2023-01-01 00:00:00",
		 *		courseRemark: "无",
		 *	}
		 */
	]);

	const queryDataForm = ref({
		stuName: "",
		courseName: "",
		courseRemark: "",
		courseStatus: null,
		currentPage: 1,
		pageSize: 5,
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

		post("/course_record/get", {
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
		login();
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
						jump("edit", { data: item, detailMap: dataDetailMap.value });
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
									title: res.msg || "删除失败",
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

	const jump = (type, data) => {
		// 关键点：使用 encodeURIComponent 包装 JSON 字符串
		const dataStr = encodeURIComponent(JSON.stringify(data));

		uni.navigateTo({
			url: `/pages/${type}/${type}?data=${dataStr}`,
		});
	};

	const handleClick = (item, detailMap) => {
		const navItem = {
			detailMap: detailMap,
			data: item,
		};
		jump("detail", navItem);
	};

	// 如果模板中需要使用这些方法，需暴露出去（setup 语法自动暴露，无需 return，仅需确保函数定义在 setup 内）
</script>

<style lang="scss">
	@import "../../static/scss/index.scss";

	.content {
		width: 100%;
		height: 100%;
		background-color: $theme-color;
		display: flex;
		align-content: center;
		flex-wrap: nowrap;
		flex-direction: column;
		align-items: center;
		justify-content: space-between;
	}
	// 简单的线条出现动画
	@keyframes lineMove {
		from {
			width: 0;
			opacity: 0;
		}
		to {
			width: 40rpx;
			opacity: 1;
		}
	}
	.data-tabs {
		width: 90%;
		display: flex;
		color: #dfdfdf;
		font-size: 15px;
		align-content: center;
		flex-direction: row;
		align-items: center;
		justify-content: space-evenly;
		position: relative; // 必须开启定位，才能使用 absolute 定位子元素
		.tab-item {
			padding: 10px 0;
			position: relative;
			transition: all 0.3s;

			.tab-text {
				color: rgba(255, 255, 255, 0.7); // 未选中时略显透明
				transition: color 0.3s;
			}

			// 选中的样式
			&.active {
				.tab-text {
					color: #fff; // 选中后纯白
					font-weight: bold;
				}

				// 底部横线
				&::after {
					content: "";
					position: absolute;
					bottom: 0;
					left: 50%;
					transform: translateX(-50%); // 居中
					width: 40rpx; // 横线宽度
					height: 4rpx; // 横线粗细
					background-color: #fff; // 横线颜色
					border-radius: 4rpx;
					animation: lineMove 0.3s ease-out; // 切换时的弹性动画
				}
			}
		}
	}

	.status {
		margin-left: 10px;
		font-size: 12px;
		color: #999;
	}

	.no-data {
		height: calc(85vh);
		bottom: -5vh;
		font-size: 20px;
		color: #666;
		display: flex;
		align-items: center;
		justify-content: center;
		// overflow: hidden;
	}
	.data-card-container {
		top: 0;
		bottom: 0;
		left: 0;
		right: 0;
		margin: 0 auto;
		width: 90%;
	}
	.fab {
		position: fixed;
		bottom: 5%;
		right: 5%;
		width: 65px;
		height: 65px;
		z-index: 3;
		border-radius: 50%;
		box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
		display: flex;
		align-items: center;
		justify-content: center;
		background-color: $theme-color;
		color: #fff;
		font-size: 20px;
	}
	.fab:active {
		background-color: #7ccac0;
		transform: scale(0.95);
		transition: transform 0.1s ease-in-out;
		transition: background-color 0.1s ease-in-out;
	}
	.top {
		width: 100%;
		height: 15%;
		display: flex;
		flex-wrap: nowrap;
		flex-direction: column;
		align-content: center;
		align-items: center;
		justify-content: center;
		position: fixed;
		background-color: $theme-color;
		z-index: 2;
	}
	.search-bar-line {
		width: 100%;
		background-color: $theme-color;
	}
	.search-bar {
		width: 70%;
		height: 50px;
		background-color: $theme-color;
	}

	.bottom {
		width: 100%;
		margin-top: 25%;
		padding-top: 10%;
		background-color: #fff;
		border-radius: 20px;
		display: flex;
		align-content: center;
		flex-wrap: nowrap;
		flex-direction: column;
		align-items: center;
		justify-content: flex-start;
		// overflow: hidden;
	}
	.data-card {
		width: 90%;
	}
	.name {
		margin-left: 10px;
	}
	.title {
		width: 100%;
		display: inline-flex;
		justify-content: space-around;
		flex-wrap: nowrap;
		flex-direction: row;
		gap: 1;
	}
	.card-title {
		font-size: 20px;
		color: #333;
		display: flex;
		align-items: center;
		justify-content: space-between;
	}
	.card-title-left {
		display: flex;
		align-items: center;
		justify-content: flex-start;
	}
	.card-title-right {
		display: flex;
		align-items: center;
		justify-content: flex-end;
	}
	.card-content {
		margin-top: 10px;
		font-size: 15px;
		color: #666;
		display: flex;
		align-items: center;
		justify-content: flex-start;
	}
	.more-icon {
		z-index: 1;
	}
	.button {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 30%;
		height: 40px;
		border-radius: 20px;
		border: 1px solid #bebebe;
		background-color: rgb(250, 250, 250);
		color: #5c5c5c;
		width: 30%;
		margin-top: 10px;
	}
	.button:active {
		background-color: #e0e0e0;
		transform: scale(0.97);
		transition: transform 0.1s ease-in-out;
		transition: background-color 0.1s ease-in-out;
	}
</style>
