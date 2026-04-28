<template>
	<view class="container">
		<scroll-view scroll-y="true" class="list-container">
			<view v-for="(item, index) in userList" :key="index" class="card">
				<view class="header">
					<view class="user-info">
						<image class="avatar" :src="item.avatar" mode="aspectFill"></image>
						<text class="username">{{ item.studentName }}</text>
					</view>
					<text class="edit-btn" @tap="handleEdit(item)">编辑资料</text>
				</view>

				<view class="content">
					<view class="info-row">
						<text class="label">联系电话：</text>
						<text class="value">{{ item.phone }} ({{ item.relation }})</text>
					</view>
					<view class="info-row">
						<text class="label">生日：</text>
						<text class="value">{{ item.birthday || "未设置" }}</text>
					</view>
					<view class="info-row">
						<text class="label">可用积分：</text>
						<text class="value highlight">{{ item.points }}</text>
					</view>
					<view class="info-row">
						<text class="label">就读学校：</text>
						<text class="value">{{ item.school || "未设置" }}</text>
					</view>
					<view class="info-row">
						<text class="label">备用号码：</text>
						<text class="value">{{ item.backupPhone || "未设置" }}</text>
					</view>
					<view class="info-row">
						<text class="label">家庭地址：</text>
						<text class="value">{{ item.address || "未设置" }}</text>
					</view>
				</view>

				<view class="footer">
					<view class="org-info">
						<text class="label">培训机构：</text>
						<text class="org-name">{{ item.organization }}</text>
					</view>
					<view class="unbind-btn" @tap="handleUnbind(item)">解绑</view>
				</view>
			</view>
		</scroll-view>
	</view>
</template>

<script lang="ts" setup>
	import { jump } from "@/utils/common";
	import { ref } from "vue";
	import { parseData } from "@/utils/common";
	import { onLoad } from "@dcloudio/uni-app";
	import { Student } from "@/types/student";

	// 模拟数据列表
	const userList = ref<Student[]>([
		{
			studentName: "范思思",
			avatar: "https://via.placeholder.com/100", // 替换为真实头像地址
			phone: "13003966216",
			relation: "母亲",
			birthday: "",
			points: 0,
			school: "",
			backupPhone: "",
			address: "",
			organization: "甲古书院龙文校区",
		},
		{
			studentName: "张小明",
			avatar: "https://via.placeholder.com/100",
			phone: "13888888888",
			relation: "父亲",
			birthday: "2015-05-20",
			points: 150,
			school: "实验小学",
			backupPhone: "13999999999",
			address: "XX市XX区XX路",
			organization: "甲古书院龙文校区",
		},
	]);

	onLoad((options) => {
		if (options) {
			const data: Student[] = parseData(options.data);
			console.log("studentList:", data);
			userList.value = data;
		}
	});

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

	const handleEdit = (item: any) => {
		console.log("编辑资料:", item);
		jump("/pages/main/edit-student-info/index", item);
	};
</script>

<style lang="scss" scoped src="./index.scss"></style>
