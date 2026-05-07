<template>
	<view class="container">
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

		<view class="student-list">
			<view
				v-for="item in students"
				:key="item.id"
				:class="['student-card', item.sex === 1 ? 'card-male' : 'card-female']"
				hover-class="card-hover-effect"
				hover-stay-time="150"
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

				<!-- 装饰性箭头 -->
				<text class="arrow-icon">▶</text>
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

			<view v-if="students.length === 0 && !isLoading" class="empty">
				<view class="empty-icon">🔍</view>
				<text class="empty-text">未找到相关学生</text>
				<text class="empty-tips">可以尝试换个姓名或学号搜索</text>
			</view>
		</view>
		<!-- 新增：右下角悬浮按钮 -->
		<view class="fab-btn" hover-class="fab-btn-active" @tap="goToAddStudent">
			<text class="plus-icon">+</text>
		</view>
	</view>
</template>

<script setup lang="ts">
	import { ref } from "vue";
	import { getStudentListByTeacherId } from "@/api/student";
	import { useUserStore } from "@/stores/user";
	import { useStudentStore } from "@/stores/student";
	import { onLoad, onReachBottom, onPullDownRefresh } from "@dcloudio/uni-app";
	import { Student } from "@/types/student";
	import { jump } from "@/utils/common/index";
	import { ROUTES } from "@/config/routes";

	const userStore = useUserStore();
	let teacherId = ref(0);

	if (userStore.userInfo?.roleId === 4) {
		teacherId.value = userStore.userInfo.identityInfo.teacherId;
	}

	// --- 分页与状态变量 ---
	const students = ref<Student[]>([]);
	const currentStudent = ref<Student | null>(null);
	const currentPage = ref(1);
	const pageSize = 10;
	const isFinished = ref(false); // 是否加载完全部
	const isLoading = ref(false); // 防抖锁：是否正在请求中

	const tempKeyword = ref("");
	const searchKeyword = ref("");

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
			const res = await getStudentListByTeacherId({
				teacherId: teacherId.value,
				currentPage: currentPage.value,
				pageSize: pageSize,
				// 如果后端支持搜索字段，建议直接传给后端分页处理
				keyword: searchKeyword.value,
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

	// --- 生命周期钩子 ---

	// 初始化加载
	onLoad(() => {
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

	// --- 点击逻辑 ---
	const handleClick = (item: Student) => {
		console.log("点击学员", item);
		// 点击记录当前选中的学员
		currentStudent.value = item;
		// 点击记录当前选中的学员到store
		const studentStore = useStudentStore();
		studentStore.setStudentInfo(item);
		// 点击跳转学员详情页
		jump(ROUTES.STUDENT_DETAIL);
	};

	// 处理长按反馈
	const handleLongPress = (item: Student) => {
		// 震动反馈
		uni.vibrateShort();

		uni.showActionSheet({
			itemList: ["编辑学生信息", "呼叫主要联系人", "删除学生"],
			itemColor: "#333",
			success: (res) => {
				if (res.tapIndex === 0) {
					// 编辑
					uni.navigateTo({ url: `/pages/student/edit?id=${item.id}` });
				} else if (res.tapIndex === 1) {
					// 拨号
					if (item.primaryParent?.phone) {
						uni.makePhoneCall({
							phoneNumber: item.primaryParent.phone,
							success: () => {
								console.log("拨号成功");
							},
							fail: (err) => {
								// 重点：判断是否是用户主动取消
								if (err.errMsg.indexOf("cancel") !== -1) {
									console.log("用户取消了拨打");
									// 这里不需要抛出异常，也不需要给用户弹窗提示
								} else {
									// 如果是其他错误（比如号码格式不对），再进行提示
									uni.showToast({ title: "拨号失败", icon: "none" });
								}
							},
						});
					} else {
						uni.showToast({ title: "暂无联系电话", icon: "none" });
					}
				} else if (res.tapIndex === 2) {
					// 删除
					confirmDelete(item);
				}
			},
		});
	};

	const confirmDelete = (item: Student) => {
		uni.showModal({
			title: "提示",
			content: `确定要移除学生 ${item.studentName} 吗？`,
			confirmColor: "#ff4d94", // 对应女生的主色调或警告色
			success: (res) => {
				if (res.confirm) {
					// 调用删除接口逻辑
				}
			},
		});
	};

	const formatAvatarText = (name: string) => {
		if (!name) return "";
		return name.length > 2 ? name.substring(name.length - 2) : name;
	};
</script>

<style lang="scss" src="./index.scss"></style>
