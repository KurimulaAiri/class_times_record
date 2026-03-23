<template>
	<view class="content">
		<scroll-view
			class="scroll-view"
			scroll-y="true"
			enable-flexible="true"
			@scrolltolower="loadMore"
			:lower-threshold="100"
		>
			<view class="detail-card">
				<view class="card-title">
					<div class="name">{{ selectData.stuName }}</div>
				</view>
				<view
					v-for="(value, key) in dataDetailMap"
					:key="key"
					class="card-content"
				>
					<view class="card-content-left"> {{ value }}</view>

					<view class="card-content-right"> {{ selectData[key] }}</view>
				</view>
			</view>
			<view class="record-list">
				<view
					v-for="(item, index) in recordList"
					:key="index"
					class="record-item"
				>
					<view class="record-item-top">
						<view class="record-item-left">
							{{ item.recordTime.split("T")[0] }}</view
						>
						<view
							class="record-item-right"
							:class="{
								'record-item-right-plus': item.recordType === 2,
								'record-item-right-minus': item.recordType === 1,
							}"
						>
							<view class="record-text" v-if="item.recordType !== 3">
								{{ typeMap[item.recordType] }} {{ item.recordChange }} 课时
							</view>
						</view>
					</view>
					<view
						class="record-item-bottom"
						v-if="item.recordRemark !== '' && item.recordRemark !== undefined"
					>
						<view class="record-remark">{{ item.recordRemark }}</view>
					</view>
				</view>
				<uni-load-more :status="loadStatus" />
			</view>
		</scroll-view>

		<view class="bottom-action-bar">
			<view class="button-group">
				<view class="action-btn primary" @click="jump('adjust', selectData)">
					<uni-icons type="compose" size="18" color="#fff"></uni-icons>
					<text>调课时</text>
				</view>
				<view
					class="action-btn secondary"
					@click="jump('edit', { data: selectData, detailMap: dataDetailMap })"
				>
					<uni-icons type="edit" size="18" color="#5c5c5c"></uni-icons>
					<text>编辑</text>
				</view>
				<view
					class="action-btn secondary"
					@click="jump('share', { data: selectData, detailMap: dataDetailMap })"
				>
					<uni-icons type="share" size="18" color="#5c5c5c"></uni-icons>
					<text>分享</text>
				</view>
			</view>
		</view>
	</view>
</template>

<script setup>
	import { onLoad, onShow } from "@dcloudio/uni-app";
	import { ref } from "vue";
	import { post } from "../../utils/request";
	const dataDetailMap = ref({});
	const selectData = ref({});
	const recordList = ref([]);

	const loadStatus = ref("more");
	const total = ref(0);
	const queryForm = ref({
		courseRecordId: 0,
		currentPage: 1,
		pageSize: 10,
	});

	const typeMap = ref({
		1: "-",
		2: "+",
		3: "",
	});

	onLoad((options) => {
		// 1. 打印原始 options 看看结构
		console.log("收到原始 options:", options);
		// 2. 这里的 options.data 才是你 jump 函数里传过来的那个 JSON 字符串
		if (options.data) {
			try {
				// 3. 先解码（对应发送端的 encodeURIComponent），再解析
				const decodedData = decodeURIComponent(options.data);
				const navItem = JSON.parse(decodedData);

				// 4. 赋值给响应式变量
				selectData.value = navItem.data;
				dataDetailMap.value = navItem.detailMap;

				console.log("解析后的 data:", selectData.value);
				console.log("解析后的 detailMap:", dataDetailMap.value);

				queryForm.value.courseRecordId = selectData.value.id;
			} catch (e) {
				console.error("解析失败，数据格式可能不对:", e);
			}
		} else {
			console.warn("未接收到名为 data 的跳转参数");
		}
		getData(true);
	});
	onShow(() => {
		getData(true);
	});

	const getData = (isRefresh = false) => {
		// 1. 请求锁：防止在请求过程中重复触发 loadMore
		if (!isRefresh && loadStatus.value === "loading") return;
		console.log("当前页:", queryForm.value.currentPage);

		if (isRefresh) {
			queryForm.value.currentPage = 1;
			loadStatus.value = "loading";
		} else {
			loadStatus.value = "loading";
		}
		post("/record/get", queryForm.value)
			.then((res) => {
				console.log("获取记录响应:", res);

				if (res.code === 200) {
					let newList = res.data.records || [];
					total.value = res.data.total || 0;

					if (!isRefresh) {
						recordList.value = [...recordList.value, ...newList];
					} else {
						recordList.value = newList;
					}

					// 核心修复：智能判断加载状态
					// 如果当前列表里的条数已经达到了后端返回的总条数，则标记为 noMore
					if (recordList.value.length >= total.value) {
						loadStatus.value = "noMore";
					} else {
						// 否则说明还有数据，恢复为 more 状态，允许下次 loadMore
						loadStatus.value = "more";
					}
				} else {
					loadStatus.value = "more"; // 失败了重置为 more，允许用户重试
					uni.showToast({
						title: res.msg || "获取记录失败",
						icon: "none",
					});
				}
			})
			.catch(() => {
				loadStatus.value = "more";
				console.error("请求异常:", e);
			});
	};

	const loadMore = () => {
		// 2. 状态拦截：只有在 'more' 状态下才允许加载下一页
		if (loadStatus.value !== "more") {
			console.log("拦截重复请求，当前状态:", loadStatus.value);
			return;
		}

		console.log("触发加载更多");
		queryForm.value.currentPage++; // 页码自增
		getData(false); // 执行分页请求
	};

	const jump = (type, data) => {
		console.log("跳转类型:", type);
		// 关键点：使用 encodeURIComponent 包装 JSON 字符串
		const dataStr = encodeURIComponent(JSON.stringify(data));
		uni.navigateTo({
			url: `/pages/${type}/${type}?data=${dataStr}`,
		});
	};
</script>

<style lang="scss" scoped src="./detail.scss"></style>
