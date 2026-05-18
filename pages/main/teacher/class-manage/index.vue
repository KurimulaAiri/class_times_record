<template>
	<view class="container">
		<SearchFilterBar
			placeholder="请输入班级名称"
			@search="handleSearch"
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
					<text class="status-tag">进行中</text>
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
		<FloatingActionButton @click="goToAddClass"/>
	</view>
</template>

<script setup lang="ts">
	import { ref } from "vue";
	import { useUserStore } from "@/stores/user";
	import { getClassListByTeacherId } from "@/api/class";
	import { onLoad, onShow } from "@dcloudio/uni-app";
	import { jump } from "@/utils/common";
	import { ROUTES } from "@/config/routes";
	
	import SearchFilterBar from "@/components/search-filter-bar/index.vue";
	import FloatingActionButton from "@/components/floating-action-button/index.vue";

	const userStore = useUserStore();

	const classList = ref<Class[]>([]);

	const queryForm = ref<ClassListByTeacherIdQueryForm>({
		teacherId: 0,
		keyword: null,
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
				teacherId,
				keyword: queryForm.value.keyword,
			};
			const res = await getClassListByTeacherId(queryForm.value);
			classList.value = res.classList || [];
		}
	});

	const handleSearch = async () => {
		console.log("搜索关键字：", queryForm.value.keyword);
		// 如果是后端搜索，这里可以发起网络请求
		queryForm.value.keyword = queryForm.value.keyword || "";
		const res = await getClassListByTeacherId(queryForm.value);
		classList.value = res.classList || [];
	};

	// 处理点击事件（通常跳转到班级详情）
	const handleCardClick = (item: Class) => {
		console.log("点击了班级:", item.className);
		jump(ROUTES.CLASS_DETAIL, item);
	};

	// 处理长按事件
	const handleCardLongPress = (item: Class) => {
		// 触发震动反馈（增强手感，仅 App/小程序支持）
		uni.vibrateShort();

		uni.showActionSheet({
			itemList: ["编辑班级", "结束课程", "删除班级"],
			itemColor: "#333",
			success: (res) => {
				switch (res.tapIndex) {
					case 0:
						console.log("点击编辑");
						jump(ROUTES.EDIT_CLASS_INFO, item);
						break;
					case 2:
						handleDeleteClass(item);
						break;
				}
			},
		});
	};

	// 模拟删除逻辑
	const handleDeleteClass = (item: Class) => {
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

	// 新增：点击添加班级按钮
	const goToAddClass = () => {
		jump(ROUTES.ADD_CLASS);
	};
</script>

<style scoped lang="scss" src="./index.scss"></style>
