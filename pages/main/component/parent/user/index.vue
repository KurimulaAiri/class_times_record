<template>
	<view class="user-container">
		<view class="header-section">
			<view class="header-left">
				<image
					class="avatar"
					src="@/static/icon/avatar.svg"
					mode="aspectFill"
				></image>
				<view class="user-text-info">
					<text class="user-name">
						{{
							userStore.userInfo?.roleId === 3
								? userStore.userInfo?.identityInfo?.username || "权限错误"
								: "未登录"
						}}
					</text>
					<!-- <view class="location-row">
						<uni-icons
							type="location-filled"
							size="14"
							color="#ccc"
						></uni-icons>
						<text class="location-text">
							{{
								studentStore.studentInfo === null
									? "未绑定任何课程"
									: studentStore.studentInfo.institutions === null
										? "未绑定任何课程"
										: studentStore.studentInfo.institutions
												.map((inst) => inst.institutionName)
												.join("、") || "未绑定任何课程"
							}}
						</text>
					</view> -->
				</view>
			</view>
			<button
				class="manage-btn"
				hover-class="manage-btn-hover"
				@tap="jump(ROUTES.MANAGE_STUDENT)"
			>
				管理学员
			</button>
		</view>

		<!-- 当前学生卡片 -->
		<view class="student-card" v-if="studentStore.studentInfo">
			<view class="student-card-header">
				<view class="student-basic">
					<image
						class="student-avatar"
						src="@/static/icon/avatar.svg"
						mode="aspectFill"
					></image>

					<view class="student-info">
						<text class="student-name">
							{{ studentStore.studentInfo.studentName || "未命名学员" }}
						</text>

						<text class="student-desc">
							{{
								studentStore.studentInfo.institutions
									?.map((item) => item.institutionName)
									.join("、") || "暂无机构"
							}}
						</text>
					</view>
				</view>

				<view class="student-tag"> 当前学员 </view>
			</view>

			<view class="student-data">
				<view class="data-item">
					<text class="data-value">
						{{
							studentStore.studentInfo.sex !== null
								? studentStore.studentInfo.sex === 1
									? "男"
									: "女"
								: "-"
						}}
					</text>
					<text class="data-label">性别</text>
				</view>

				<view class="data-item">
					<text class="data-value">
						{{
							studentStore.studentInfo.birthStr !== null
								? studentStore.studentInfo.birthStr
								: "-"
						}}
					</text>
					<text class="data-label">生日</text>
				</view>

				<view class="data-item">
					<text class="data-value">
						{{
							studentStore.studentInfo.school !== null
								? studentStore.studentInfo.school
								: "-"
						}}
					</text>
					<text class="data-label">学校</text>
				</view>
			</view>
		</view>

		<view class="grid-menu" v-if="hasVisibleItems">
			<!-- 用 template 承载循环逻辑 -->
			<template v-for="(gridItem, index) in gridList" :key="index">
				<!-- 在子元素上进行条件判断 -->
				<view class="grid-item" v-if="gridItem.isVisible">
					<view
						class="grid-icon-box"
						:style="{ backgroundColor: gridItem.bgColor }"
					>
						<uni-icons :type="gridItem.icon" size="24" color="#fff"></uni-icons>
					</view>
					<text class="grid-label">{{ gridItem.name }}</text>
				</view>
			</template>
		</view>

		<view class="list-card-bg">
			<template v-for="(item, index) in subMenuList" :key="index">
				<view class="list-item" hover-class="item-hover" @tap="jump(item.path)" v-if="item.isVisible">
					<view class="item-left">
						<view class="icon-wrap" :style="{ backgroundColor: item.color }">
							<uni-icons :type="item.icon" size="18" color="#fff"></uni-icons>
						</view>
						<text class="item-text">{{ item.menuName }}</text>
					</view>
					<uni-icons type="right" size="16" color="#bbb"></uni-icons>
				</view>
			</template>
		</view>

		<view class="footer-actions">
			<view
				class="action-btn border-bottom"
				@tap="handleAction('switch')"
				hover-class="item-hover"
			>
				<text>切换账号</text>
			</view>
			<view
				class="action-btn"
				@tap="handleAction('logout')"
				hover-class="item-hover"
			>
				<text>退出登录</text>
			</view>
		</view>
	</view>
</template>

<script setup lang="ts">
	import { ref, onMounted, computed } from "vue";

	import { getStudentListByParentId } from "@/api/student";
	import { logOut } from "@/api/auth";

	import { useUserStore } from "@/stores/user";
	import { useStudentStore } from "@/stores/student";

	import { jump } from "@/utils/common";
	import { ROUTES } from "@/config/routes";

	const userStore = useUserStore();
	const userInfo = userStore.userInfo;

	const studentStore = useStudentStore();

	// 1. 顶部四个图标数据优化
	const gridList = ref([
		{
			name: "余额",
			icon: "wallet-filled",
			bgColor: "#86e1b6",
			isVisible: false,
		},
		{ name: "考勤码", icon: "scan", bgColor: "#7cb5ff", isVisible: false }, // 改为扫描图标模拟二维码
		{ name: "我的订单", icon: "compose", bgColor: "#7adcf0", isVisible: false }, // 微调颜色
		{
			name: "优惠券",
			icon: "gift-filled",
			bgColor: "#ffb37c",
			isVisible: false,
		},
	]);

	// 1. 过滤出可见的子项
	const activeGridList = computed(() => {
		return gridList.value.filter((item) => item.isVisible);
	});

	// 2. 判断是否有任何可见项
	const hasVisibleItems = computed(() => activeGridList.value.length > 0);

	// 2. 下方列表数据优化（图标和颜色更贴合原图）
	const subMenuList = ref([
		{
			menuName: "礼品兑换",
			icon: "gift",
			color: "#86e1b6",
			path: "/pages/main/gift/index/index",
			isVisible: false,
		},
		{
			menuName: "兑换记录",
			icon: "star-filled",
			color: "#7cb5ff",
			path: "/pages/main/exchange/index/index",
			isVisible: false,
		},
		{
			menuName: "积分记录",
			icon: "wallet",
			color: "#ffb37c",
			path: "/pages/main/points/index/index",
			isVisible: false,
		},
		{
			menuName: "成绩单",
			icon: "paperplane-filled",
			color: "#7adcf0",
			path: "/pages/main/score/index/index",
			isVisible: false,
		},
		{
			menuName: "考勤记录",
			icon: "checkbox-filled",
			color: "#b999f7",
			path: "/pages/main/attendance/index/index",
			isVisible: false,
		},
		{
			menuName: "机构通知",
			icon: "notification-filled",
			color: "#86e1b6",
			path: "/pages/main/notice/index/index",
			isVisible: false,
		},
		{
			menuName: "分享小程序",
			icon: "redo-filled",
			color: "#ffb37c",
			path: "/pages/main/share/index",
			isVisible: false,
		},
		{
			menuName: "去往旧版",
			icon: "arrow-right",
			color: "#7adcf0",
			path: "/pages/class-record/index/index",
			isVisible: true,
		},
	]);

	const handleAction = (type: string) => {
		console.log("点击了操作:", type);
		// 实现具体的切换账号或退出逻辑
		switch (type) {
			case "switch":
				// 切换账号逻辑
				break;
			case "logout":
				logOut();
				break;
			default:
				break;
		}
	};

	onMounted(async () => {
		studentStore.setStudentList(
			await getStudentListByParentId({
				parentId: userInfo?.roleId === 3 ? userInfo?.identityInfo.parentId : 0,
				currentPage: 1,
				pageSize: 10,
			}),
		);

		if (studentStore.studentList.length > 0) {
			let currentStudent = studentStore.studentInfo;
			if (currentStudent) {
				console.log("当前学生:", currentStudent);
			} else {
				studentStore.setStudentInfo(studentStore.studentList[0]);
				console.log(
					"当前学生为空，存入第一个学生:",
					studentStore.studentList[0],
				);
			}
		}
	});
</script>
<style scoped lang="scss" src="./index.scss"></style>
