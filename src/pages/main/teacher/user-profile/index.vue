<template>
	<view class="container">
		<view class="header-bg"></view>

		<view class="main-card">
			<view class="avatar-big">
				{{ formatAvatarText(identityInfo?.username || "") }}
			</view>
			<view class="name-section">
				<text class="name">{{ identityInfo?.username || "" }}</text>
				<text v-if="isAdmin" class="admin-tag">管理员</text>
			</view>
			<view class="id-badge">教师ID: {{ identityInfo?.teacherId || "" }}</view>
		</view>

		<FormPage :groups="groups" v-model:model-value="formData">
			<template #group-1>
				<view class="info-item" @tap="goEditInstitution">
					<text class="label">机构名称</text>
					<view class="value-wrapper">
						<text class="value">{{
							identityInfo?.institution?.institutionName || "未填写"
						}}</text>
						<uni-icons type="right" size="14" color="#ccc"></uni-icons>
					</view>
				</view>
				<view class="info-item">
					<text class="label">机构码</text>
					<text class="value">{{
						identityInfo?.institution?.institutionCode || "未填写"
					}}</text>
				</view>
				<view class="info-item">
					<text class="label">机构地址</text>
					<text class="value">{{
						identityInfo?.institution?.institutionAddress || "未填写"
					}}</text>
				</view>
			</template>
		</FormPage>

		<PageFooter
			:buttons="footerButtons"
			@btnClick="handleFooterClick"
		></PageFooter>
	</view>
</template>

<script setup lang="ts">
	import { ref, computed } from "vue";
	import { onShow } from "@dcloudio/uni-app";
	import { useUserStore } from "@/stores/user";
	import { jump, showToast } from "@/utils/common";
	import { ROUTES } from "@/config/routes";
	import { getInstitutionById } from "@/api/institution";
	import { updateTeacherById } from "@/api/teacher";
	import FormPage from "@/components/form-page/index.vue";
	import PageFooter from "@/components/page-footer/index.vue";

	const userStore = useUserStore();

	/** 当前是否编辑模式 */
	const isEditing = ref(false);

	/** 表单数据，用于 v-model 绑定 */
	const formData = ref<Record<string, any>>({});

	/** 获取身份信息（教师身份） */
	const identityInfo = computed(() => {
		const info = userStore.userInfo;
		if (info?.roleId === 4) return info.identityInfo as TeacherIdentity;
		return null;
	});

	/** 是否为管理员 */
	const isAdmin = computed(() => {
		const info = userStore.userInfo;
		return info?.roleId === 4 && info.admin?.isAvailable;
	});

	/** 表单分组配置 */
	const groups = computed<FormGroupConfig[]>(() => [
		{
			title: "个人信息",
			titleStyle: "theme",
			mode: isEditing.value ? "edit" : "display",
			items: [
				{
					key: "username",
					label: "用户名",
					inputAlign: "right",
					type: "input",
					emptyText: "未填写",
				},
			],
		},
		{
			title: "所属机构",
			titleStyle: "theme",
			mode: "display",
			items: [],
		},
		{
			title: "系统信息",
			titleStyle: "theme",
			mode: "display",
			items: [
				{
					key: "userId",
					label: "用户ID",
					type: "text",
					emptyText: "未知",
					small: true,
				},
				{
					key: "createTimeStr",
					label: "注册时间",
					type: "text",
					emptyText: "未知",
					small: true,
				},
				{
					key: "updateTimeStr",
					label: "最后更新",
					type: "text",
					emptyText: "未知",
					small: true,
				},
			],
		},
	]);

	/** 底部按钮配置 */
	const footerButtons = computed<FooterButton[]>(() => {
		if (isEditing.value) {
			return [
				{ text: "取消", type: "secondary" },
				{ text: "保存", type: "primary" },
			];
		}
		return [{ text: "编辑资料", type: "primary" }];
	});

	/** 初始化表单数据 */
	const initFormData = () => {
		const info = userStore.userInfo;
		if (!info) return;
		formData.value = {
			username: info.identityInfo?.username || "",
			userId: info.userId,
			createTimeStr: info.createTimeStr || "",
			updateTimeStr: info.updateTimeStr || "",
		};
	};

	onShow(() => {
		initFormData();
		// 监听机构信息变更后刷新
		refreshInstitution();
	});

	/** 刷新机构信息 */
	const refreshInstitution = async () => {
		const info = userStore.userInfo;
		if (info?.roleId === 4) {
			const insId = info.identityInfo.institutionId;
			if (insId) {
				const newIns = await getInstitutionById({ institutionId: insId });
				if (newIns && info.identityInfo) {
					info.identityInfo.institution = newIns;
					userStore.setUserInfo({ ...info });
				}
			}
		}
	};

	/** 格式化头像文字（取姓名首字） */
	const formatAvatarText = (name: string) => {
		if (!name) return "无";
		return name.length > 2 ? name.substring(name.length - 2) : name;
	};

	/** 跳转到编辑机构信息页面 */
	const goEditInstitution = () => {
		const ins = identityInfo.value?.institution;
		if (ins) {
			jump(ROUTES.EDIT_INSTITUTION_INFO, ins);
		}
	};

	/** 底部按钮点击处理 */
	const handleFooterClick = (index: number) => {
		const btn = footerButtons.value[index];
		if (btn.text === "编辑资料") {
			isEditing.value = true;
		} else if (btn.text === "取消") {
			isEditing.value = false;
			initFormData();
		} else if (btn.text === "保存") {
			saveProfile();
		}
	};

	const validated = () => {
		const newUsername = formData.value.username?.trim();
		if (!newUsername) {
			showToast({ msg: "用户名不能为空" });
			return false;
		}
		return true;
	};

	/** 保存个人资料 */
	const saveProfile = async () => {
		if (!validated()) return;

		// 调用 API 更新用户名
		const effect = await updateTeacherById({
			institutionId: identityInfo.value?.institutionId || 0,
			teacherId: identityInfo.value?.teacherId || 0,
			username: formData.value.username,
		});

		if (effect === 1) {
			showToast({ msg: "更新成功" });
			// 更新本地 store 中的用户名
			const info = userStore.userInfo;
			if (info?.roleId === 4 && info.identityInfo) {
				info.identityInfo.username = formData.value.username;
				userStore.setUserInfo({ ...info });
			}
			isEditing.value = false;

			return;
		} else {
			showToast({ msg: "更新失败" });
		}
	};
</script>

<style scoped lang="scss" src="./index.scss"></style>
