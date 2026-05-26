<template>
	<view class="container">
		<scroll-view
			scroll-y="true"
			class="list-container"
			:refresher-enabled="true"
			:refresher-triggered="isRefreshing"
			@refresherrefresh="onRefresherRefresh"
		>
			<view v-for="(item, index) in studentList" :key="index" class="card">
				<view class="header">
					<view class="user-info">
						<image class="avatar" :src="item.avatar" mode="aspectFill"></image>
						<text class="username">{{ item.studentName }}</text>
					</view>
					<text class="edit-btn" @tap="handleEdit(item)">编辑资料</text>
				</view>

				<view class="content">
					<view class="info-row">
						<text class="label">关系：</text>
						<text class="value">{{ item.relation }}</text>
					</view>
					<view class="info-row">
						<text class="label">生日：</text>
						<text class="value">{{ item.birthStr || "未设置" }}</text>
					</view>
					<!-- <view class="info-row">
						<text class="label">可用积分：</text>
						<text class="value highlight">{{ item.points }}</text>
					</view> -->
					<view class="info-row">
						<text class="label">就读学校：</text>
						<text class="value">{{ item.school || "未设置" }}</text>
					</view>
					<!-- <view class="info-row">
						<text class="label">备用号码：</text>
						<text class="value">{{ item.backupPhone || "未设置" }}</text>
					</view> -->
					<view class="info-row">
						<text class="label">家庭地址：</text>
						<text class="value">{{ item.address || "未设置" }}</text>
					</view>
				</view>

				<view class="footer">
					<view class="org-info">
						<text class="label">培训机构：</text>
						<!-- <text class="org-name">{{ item.organization }}</text> -->
						<text class="org-name">
							{{
								item.institutions
									.map((inst) => inst.institutionName)
									.join("、") || "未绑定任何课程"
							}}
						</text>
					</view>
					<view class="unbind-btn" @tap="handleUnbind(item)">解绑</view>
				</view>
			</view>
		</scroll-view>
	</view>
</template>

<script lang="ts" setup>
	import { jump, showToast } from "@/utils/common";
	import { ref } from "vue";
	import { onShow } from "@dcloudio/uni-app";
	import { ROUTES } from "@/config/routes";
	import { useUserStore } from "@/stores/user";
	import { useStudentStore } from "@/stores/student";
	import { getStudentListByParentId } from "@/api/student";

	// 模拟数据列表
	const studentList = ref<StudentResponse[]>([]);
	const isRefreshing = ref(false); // 控制下拉刷新状态
	const userStore = useUserStore();
	const studentStore = useStudentStore();

	onShow(() => {
		studentList.value = studentStore.studentList;
	});

	/** 解绑学生与课程的关联 */
	const handleUnbind = (item: any) => {
		uni.showModal({
			title: "提示",
			content: `确定要解绑 ${item.name} 吗？`,
			success: (res) => {
				if (res.confirm) {
					console.log("解绑成功");
				}
			},
		});
	};

	/** 跳转到编辑学生信息页面 */
	const handleEdit = (item: any) => {
		console.log("编辑资料:", item);
		jump(ROUTES.EDIT_STUDENT_INFO, item);
	};

	/** 获取学生列表数据 */
	const fetchStudentList = async () => {
		try {
			if (userStore.userInfo?.roleId === 3) {
				console.log("正在刷新数据...");
				studentList.value = await getStudentListByParentId({
					parentId: userStore.userInfo?.identityInfo.parentId,
					currentPage: 1,
					pageSize: 10,
				});
			}
		} catch (e) {
			console.error("刷新失败", e);
		}
	};

	/** 下拉刷新回调 */
	const onRefresherRefresh = async () => {
		if (isRefreshing.value) return; // 防止重复触发

		isRefreshing.value = true; // 开启刷新动画

		await fetchStudentList(); // 等待数据加载完成

		// 延迟一会关闭动画，体验更好
		setTimeout(() => {
			isRefreshing.value = false;
			showToast("刷新成功", "success");
		}, 500);
	};
</script>

<style lang="scss" scoped src="./index.scss"></style>
