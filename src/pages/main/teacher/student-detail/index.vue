<template>
	<view class="container">
		<view class="header-bg"></view>

		<view class="main-card">
			<view class="avatar-section">
				<view :class="['avatar-big', student?.sex === 1 ? 'male' : 'female']">
					{{ formatAvatarText(student?.studentName || "") }}
				</view>
			</view>
			<view class="name-section">
				<text class="name">{{ student?.studentName || "" }}</text>
				<text
					:class="[
						'gender-tag',
						student?.sex === 1 ? 'male-tag' : 'female-tag',
					]"
				>
					{{ student?.sex === 1 ? "男" : "女" }}
				</text>
			</view>
			<view class="id-badge">学号: {{ student?.id || "" }}</view>
		</view>

		<FormPage :groups="groups" :modelValue="student">
			<template #group-1>
				<view class="info-item" v-if="student?.primaryParent">
					<text class="label">主要联系人</text>
					<view class="value contact-horizontal">
						<view class="relation-tag">{{ student.primaryParent.relation }}</view>
						<view class="phone-wrapper-mini" @tap="makePhoneCall(student.primaryParent.phone)">
							<text class="phone">{{ student.primaryParent.phone }}</text>
							<image class="phone-icon" src="/static/icon/phone.svg" mode="aspectFit"></image>
						</view>
					</view>
				</view>
				<view class="info-item" v-if="student?.secondaryParent">
					<text class="label">备用联系人</text>
					<view class="value contact-horizontal">
						<view class="relation-tag">{{ student.secondaryParent.relation }}</view>
						<view class="phone-wrapper-mini" @tap="makePhoneCall(student.secondaryParent.phone)">
							<text class="phone">{{ student.secondaryParent.phone }}</text>
							<image class="phone-icon" src="/static/icon/phone.svg" mode="aspectFit"></image>
						</view>
					</view>
				</view>
				<view class="empty-state" v-if="!student?.primaryParent && !student?.secondaryParent">
					<uni-icons type="info" size="30" color="#999"></uni-icons>
					<text class="empty-text">暂无联系人</text>
				</view>
			</template>
			<template #group-2>
				<view class="class-list" v-if="classList && classList.length > 0">
					<view class="class-card" v-for="(item, index) in classList" :key="index">
						<view class="info-item">
							<text class="label">班级名称</text>
							<text class="value">{{ item.className }}</text>
						</view>
						<view class="info-item">
							<text class="label">课程名称</text>
							<text class="value">{{ item.courseName }}</text>
						</view>
						<view class="info-item">
							<text class="label">班级ID</text>
							<text class="value">{{ item.id }}</text>
						</view>
						<view class="info-item small">
							<text class="label">学生人数</text>
							<text class="value">{{ item.studentCount }}人</text>
						</view>
					</view>
				</view>
				<view class="empty-state" v-else>
					<uni-icons type="info" size="30" color="#999"></uni-icons>
					<text class="empty-text">暂无报读班级</text>
				</view>
			</template>
		</FormPage>

		<view class="footer-btns">
			<view
				class="edit-btn"
				hover-class="btn-hover"
				hover-stay-time="50"
				@tap="handleEdit"
				>编辑档案</view
			>
		</view>
	</view>
</template>

<script setup lang="ts">
	import { ref } from "vue";
	import { useStudentStore } from "@/stores/student";
	import { getClassListByStudentId } from "@/api/class";
	import { onLoad, onShow } from "@dcloudio/uni-app";
	import { jump } from "@/utils/common";
	import { ROUTES } from "@/config/routes";
	import FormPage from "@/components/form-page/index.vue";

	const studentStore = useStudentStore();
	const student = ref<StudentResponse>();
	const classList = ref<ClassResponse[]>([]);

	const groups: FormGroupConfig[] = [
		{
			title: "基本信息",
			titleStyle: "theme",
			mode: "display",
			items: [
				{ key: "birthStr", label: "出生日期", type: "text", emptyText: "未填写" },
				{ key: "school", label: "就读学校", type: "text", emptyText: "未填写" },
				{ key: "address", label: "家庭住址", type: "text", emptyText: "未填写" },
			],
		},
		{
			title: "联系人信息",
			titleStyle: "theme",
			mode: "display",
			items: [],
		},
		{
			title: "报读班级",
			titleStyle: "theme",
			mode: "display",
			items: [],
		},
		{
			title: "系统记录",
			titleStyle: "theme",
			mode: "display",
			items: [
				{ key: "createTimeStr", label: "创建时间", type: "text", emptyText: "未知", small: true },
				{ key: "updateTimeStr", label: "最后更新", type: "text", emptyText: "未知", small: true },
			],
		},
	];

	onLoad(async () => {
		const classListIn = await getClassListByStudentId(student?.value?.id || 0);
		console.log("接收到报读班级:", classListIn.classList);
		classList.value = classListIn.classList;
	});

	onShow(() => {
		if (studentStore.studentInfo) {
			student.value = studentStore.studentInfo;
		}
	});

	const formatAvatarText = (name: string) => {
		if (!name) return "无";
		return name.length > 2 ? name.substring(name.length - 2) : name;
	};

	const makePhoneCall = (phoneNumber: string) => {
		uni.makePhoneCall({
			phoneNumber: phoneNumber,
			success: () => {
				console.log("拨号成功");
			},
			fail: (err) => {
				if (err.errMsg.indexOf("cancel") !== -1) {
					console.log("用户取消了拨打");
				} else {
					uni.showToast({ title: "拨号失败", icon: "none" });
				}
			},
		});
	};

	const handleEdit = () => {
		console.log("跳转编辑页");
		jump(ROUTES.EDIT_STUDENT_INFO_TEACHER);
	};
</script>

<style scoped lang="scss" src="./index.scss"></style>
