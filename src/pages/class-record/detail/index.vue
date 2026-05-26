<template>
	<view class="content">
		<scroll-view
			class="scroll-view"
			scroll-y="true"
			enable-flexible="true"
			@scrolltolower="loadMore"
			:lower-threshold="100"
		>
			<view class="text"> 课程详情 </view>
			<view class="detail-card">
				<view class="card-title">
					<div class="name">{{ selectData.stuName }}</div>
				</view>
				<view
					v-for="(value, key) in DATA_DETAIL_MAP"
					:key="key"
					class="card-content"
				>
					<view class="card-content-left"> {{ value }}</view>

					<view class="card-content-right"> {{ selectData[key] }}</view>
				</view>
			</view>
			<view class="text">课时记录</view>
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
				<uni-load-more :status="loadStatus" class="uni-load-more" />
			</view>
		</scroll-view>

		<uni-popup ref="sharePopup" type="bottom" border-radius="20px 20px 0 0">
			<view class="share-container">
				<view class="share-header">选择分享类型</view>

				<view class="share-list">
					<button
						class="share-item"
						@click="handleShare('1')"
						open-type="share"
					>
						<view class="share-item-main">邀请管理员</view>
						<view class="share-item-note"
							>其他管理员也可以一起修改课程信息和记录课时</view
						>
					</button>

					<button
						class="share-item"
						@click="handleShare('2')"
						open-type="share"
					>
						<view class="share-item-main">分享给他人</view>
						<view class="share-item-note">他人仅能查看相关信息，不能修改</view>
					</button>
				</view>

				<view class="share-cancel" @click="closeShare">取消</view>
			</view>
		</uni-popup>

		<view class="bottom-action-bar" v-if="selectData.permissionType === 1">
			<view class="button-group">
				<view
					class="action-btn primary"
					@click="toJump(ROUTES.CLASS_RECORD_ADJUST, selectData)"
				>
					<uni-icons type="compose" size="18" color="#fff"></uni-icons>
					<text>调课时</text>
				</view>
				<view
					class="action-btn secondary"
					@click="toJump(ROUTES.CLASS_RECORD_EDIT, selectData)"
				>
					<uni-icons type="edit" size="18" color="#5c5c5c"></uni-icons>
					<text>编辑</text>
				</view>
				<view class="action-btn secondary" @click="toJump('share', selectData)">
					<uni-icons type="share" size="18" color="#5c5c5c"></uni-icons>
					<text>分享</text>
				</view>
			</view>
		</view>
	</view>
</template>

<script setup lang="ts">
	import type {
		CourseRecordResponse,
		RecordResponse,
		CourseRecordListResponse,
		RecordListResponse,
	} from ".";
	import { DATA_DETAIL_MAP } from "@/config/common";
	import { onLoad, onShow, onShareAppMessage } from "@dcloudio/uni-app";
	import { ref } from "vue";
	import { jump, parseData, showToast } from "@/utils/common";
	import { ROUTES } from "@/config/routes";
	import { loginNoPwd } from "@/api/auth";
	import { post } from "@/utils/request";

	/** 当前选中的课卡记录数据 */
	const selectData = ref<CourseRecordResponse>({} as CourseRecordResponse);
	/** 课卡记录列表 */
	const recordList = ref<RecordResponse[]>([]);
	/** 绑定表单数据 */
	const bindForm = ref({
		courseRecordId: 0,
		permissionType: "",
	});

	/** 分享类型 */
	const shareType = ref("");
	/** 分享弹窗是否显示 */
	const sharePopup = ref<any>(null!);

	/** 列表加载状态 */
	const loadStatus = ref("more");
	/** 记录总数 */
	const total = ref(0);
	/** 查询表单参数 */
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
		if (options) {
			// 新增：处理分享进入的情况
			if (options.courseRecordId && options.fromShare === "true") {
				console.log("分享进入，分享类型:", options.shareType);

				console.log("分享进入，课程记录ID:", options.courseRecordId);

				const shareId = options.courseRecordId;

				// 2. 先登录，确保有用户信息
				loginNoPwd();

				bindForm.value.courseRecordId = shareId;
				bindForm.value.permissionType = options.shareType;

				// 调用后端接口，将此课程记录关联到当前登录用户的账户下
				post("/permission_record/bind", bindForm.value).then((res) => {
					if (res.code === 200) {
						showToast("已保存至我的课程", "success");
						// 绑定成功后，重新加载数据
						queryForm.value.courseRecordId = shareId;

						post<CourseRecordListResponse>("/course_record/get", {
							id: shareId,
							share: true,
						}).then((res) => {
							console.log("在分享的前提下请求了一次get接口");
							if (res.code === 200) {
								console.log("获取课程记录响应:", res);
								selectData.value = res.data.courseRecords[0];
							}
						});
						getData(true);
					}
				});
			} else {
				// 2. 这里的 options.data 才是你 jump 函数里传过来的那个 JSON 字符串
				if (options.data) {
					try {
						// 3. 先解码（对应发送端的 encodeURIComponent），再解析
						const navItem = parseData(options.data);

						// 4. 赋值给响应式变量
						selectData.value = navItem;

						console.log("解析后的 data:", selectData.value);

						queryForm.value.courseRecordId = selectData.value.id;
					} catch (e) {
						console.error("解析失败，数据格式可能不对:", e);
					}
				} else {
					console.warn("未接收到名为 data 的跳转参数");
				}
			}
		}
		getData(true);
	});

	onShow(() => {
		console.log("onShow");
		post<CourseRecordListResponse>("/course_record/get", {
			id: selectData.value.id,
			isShare: true,
		}).then((res) => {
			if (res.code === 200) {
				console.log("获取课程记录响应:", res);
				selectData.value = res.data.courseRecords[0];
			}
		});
		getData(true);
	});

	/** 获取课卡记录详情数据 */
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
		post<RecordListResponse>("/record/get", queryForm.value)
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
					loadStatus.value = "more";
					showToast(res.message || "获取记录失败");
				}
			})
			.catch((e) => {
				loadStatus.value = "more";
				console.error("请求异常:", e);
			})
			.finally(() => {
				uni.hideLoading();
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

	const closeShare = () => {
		sharePopup.value.close();
	};

	// 定义分享卡片的内容
	onShareAppMessage((res) => {
		// 关闭弹窗
		sharePopup.value.close();

		// 这里的 path 是关键：好友点击后进入哪个页面，并带上当前课程的 ID
		const sharePath = `/pages/detail/detail?courseRecordId=${selectData.value.id}&fromShare=true&shareType=${shareType.value}`;
		console.log("分享路径:", sharePath);
		return {
			title: `【课时记录】${selectData.value.stuName} 的课程详情`,
			path: sharePath,
			imageUrl: "", // 可以自定义分享图，不传则默认截取当前页面
		};
	});

	/** 处理分享操作 */
	const handleShare = (shareTypeIn) => {
		// 这种方式在小程序中无法通过 JS 直接唤起转发
		// 必须引导用户点击 open-type="share" 的按钮
		// 其他分享逻辑（如生成海报）
		shareType.value = shareTypeIn;
	};

	/** 跳转到指定页面 */
	const toJump = (type, data) => {
		if (type === "share") {
			sharePopup.value.open();
			return;
		}
		jump(type, data);
	};
</script>

<style lang="scss" scoped src="./index.scss"></style>
