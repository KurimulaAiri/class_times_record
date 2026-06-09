<template>
	<view class="container">
		<FormPage :groups="groups" v-model:modelValue="form">
			<template #group-1>
				<view
					v-if="!showAccountFields"
					class="change-password-btn"
					@tap="openAccountEditor"
				>
					<text>修改登录账号</text>
					<uni-icons type="right" size="14" color="#ccc"></uni-icons>
				</view>
				<view v-else class="password-section">
					<view class="password-header">
						<text class="password-title">修改登录账号</text>
						<text class="password-cancel" @tap="cancelAccount">取消</text>
					</view>
					<view class="password-fields">
						<view class="password-field">
							<text class="label">当前账号</text>
							<text class="value-text">{{ currentAccount }}</text>
						</view>
						<view class="password-field">
							<text class="label">新登录账号</text>
							<input
								class="input"
								type="text"
								v-model="accountForm.account"
								placeholder="请输入新登录账号"
								placeholder-class="placeholder"
							/>
						</view>
					</view>
				</view>

				<view
					v-if="!showPasswordFields"
					class="change-password-btn"
					@tap="showPasswordFields = true"
				>
					<text>修改密码</text>
					<uni-icons type="right" size="14" color="#ccc"></uni-icons>
				</view>
				<view v-else class="password-section">
					<view class="password-header">
						<text class="password-title">修改密码</text>
						<text class="password-cancel" @tap="cancelPassword">取消</text>
					</view>
					<view class="password-fields">
						<view class="password-field">
							<text class="label">新密码</text>
							<input
								class="input"
								type="text"
								:password="true"
								v-model="passwordForm.password"
								placeholder="请输入新密码"
								placeholder-class="placeholder"
							/>
						</view>
						<view class="password-field">
							<text class="label">确认密码</text>
							<input
								class="input"
								type="text"
								:password="true"
								v-model="passwordForm.confirmPassword"
								placeholder="请再次输入密码"
								placeholder-class="placeholder"
							/>
						</view>
					</view>
				</view>
			</template>
		</FormPage>

		<PageFooter
			:buttons="[{ text: '保存修改', type: 'primary' }]"
			@btnClick="submitForm"
		></PageFooter>
	</view>
</template>

<script setup lang="ts">
	import { ref, computed } from "vue";
	import { updateTeacherById } from "@/api/teacher";
	import { getUserAuthInfoByTeacherId } from "@/api/auth";
	import { showToast, usePageData } from "@/utils/common";
	import { useUserStore } from "@/stores/user";
	import FormPage from "@/components/form-page/index.vue";
	import PageFooter from "@/components/page-footer/index.vue";
	import { encryptPassword } from "@/utils/crypto";

	const userStore = useUserStore();

	/** 教师原始数据 */
	const teacher = ref<TeacherResponse>({} as TeacherResponse);

	/** 表单数据 */
	const form = ref<UpdateTeacherByIdRequest>({} as UpdateTeacherByIdRequest);

	/** 是否显示密码修改区域 */
	const showPasswordFields = ref(false);

	/** 是否显示登录账号修改区域 */
	const showAccountFields = ref(false);

	/** 密码表单（独立于主表单，不展示在 display 模式中） */
	const passwordForm = ref({
		password: "",
		confirmPassword: "",
	});

	/** 登录账号表单（独立于主表单，不展示在 display 模式中） */
	const accountForm = ref({
		account: "",
	});

	/** 当前登录账号（从接口获取） */
	const currentAccount = ref("");

	/** 是否可用选项 */
	const availableOptions = [
		{ label: "启用", value: true },
		{ label: "停用", value: false },
	];

	/** 当前编辑的教师是否是登录用户自己 */
	const isSelf = computed(() => {
		const currentTeacherId = userStore.userInfo?.roleId === 4
			? userStore.userInfo.identityInfo.teacherId
			: null;
		return teacher.value.teacherId === currentTeacherId;
	});

	/** 表单分组配置 */
	const groups = computed<FormGroupConfig[]>(() => [
		{
			title: "教师信息",
			titleStyle: "theme",
			mode: "edit",
			items: [
				{
					key: "username",
					label: "教师用户名",
					type: "input",
					required: true,
					placeholder: "请输入教师用户名",
				},
				{
					key: "isAvailable",
					label: "账号状态",
					type: "radio",
					options: availableOptions,
				},
			],
		},
		{
			title: "安全设置",
			titleStyle: "theme",
			mode: "display",
			items: [],
		},
	]);

	usePageData((data) => {
		teacher.value = data;
		form.value = {
			teacherId: data.teacherId,
			username: data.username,
			isAvailable: data.isAvailable,
		};
	});

	/** 取消密码修改 */
	const cancelPassword = () => {
		showPasswordFields.value = false;
		passwordForm.value = { password: "", confirmPassword: "" };
	};

	/** 打开登录账号编辑区域，先查询当前账号 */
	const openAccountEditor = async () => {
		try {
			const res = await getUserAuthInfoByTeacherId({
				teacherId: teacher.value.teacherId,
			});
			currentAccount.value = res.data.account || "";
		} catch (error) {
			showToast({ msg: "获取当前账号失败" });
			return;
		}
		showAccountFields.value = true;
	};

	/** 取消登录账号修改 */
	const cancelAccount = () => {
		showAccountFields.value = false;
		accountForm.value = { account: "" };
	};

	const valid = () => {
		if (!form.value.username?.trim()) {
			showToast({ msg: "教师用户名不能为空" });
			return false;
		}

		// 禁止禁用自己的账号
		if (isSelf.value && form.value.isAvailable === false) {
			showToast({ msg: "不能禁用自己的账号" });
			return false;
		}

		// 如果展开了账号区域，校验登录账号
		if (showAccountFields.value) {
			if (!accountForm.value.account) {
				showToast({ msg: "请输入新登录账号" });
				return false;
			}
		}

		// 如果展开了密码区域，校验密码
		if (showPasswordFields.value) {
			if (!passwordForm.value.password) {
				showToast({ msg: "请输入新密码" });
				return false;
			}
			if (passwordForm.value.password !== passwordForm.value.confirmPassword) {
				showToast({ msg: "两次密码输入不一致" });
				return false;
			}
		}
		return true;
	};

	/** 提交表单 */
	const submitForm = async () => {
		if (!valid()) {
			return;
		}

		const req: UpdateTeacherByIdRequest = {
			teacherId: teacher.value!.teacherId,
			username: form.value.username.trim(),
			isAvailable: form.value.isAvailable,
		};

		// 仅在展开账号区域且填写了账号时才传 account
		if (showAccountFields.value && accountForm.value.account) {
			req.account = accountForm.value.account;
		}

		// 仅在展开密码区域且填写了密码时才传 password
		if (showPasswordFields.value && passwordForm.value.password) {
			req.password = encryptPassword(passwordForm.value.password);
		}

		console.log("提交请求:", req);

		try {
			const effect = await updateTeacherById(req);
			if (effect > 0) {
				showToast({ msg: "修改成功", icon: "success" });
				uni.$emit("needRefreshTeacher");
				setTimeout(() => uni.navigateBack(), 1500);
			}
		} catch (error) {
			showToast({ msg: "修改失败" });
		}
	};
</script>

<style scoped lang="scss" src="./index.scss"></style>
