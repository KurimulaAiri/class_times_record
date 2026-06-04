<template>
	<view class="content">
		<view class="login-form">
			<view class="login-form-title">
				{{ role === 4 ? "教师" : "家长" }}登录
			</view>

			<view class="login-form-content">
				<!-- 账号项 -->
				<view class="login-form-item">
					<view class="login-form-item-label">账号</view>
					<view class="login-form-item-input">
						<input
							type="text"
							placeholder="请输入手机号/账号"
							placeholder-class="input-placeholder"
							v-model="account"
						/>
					</view>
				</view>

				<!-- 密码项 -->
				<view class="login-form-item">
					<view class="login-form-item-label">密码</view>
					<view class="login-form-item-input">
						<input
							password
							type="password"
							placeholder="请输入密码"
							placeholder-class="input-placeholder"
							v-model="password"
						/>
					</view>
				</view>

				<view class="login-form-item">
					<view class="login-form-item-label">登录机构</view>

					<view class="custom-select-container">
						<view
							class="login-form-item-input institution-select-header"
							:class="{ 'select-header-active': isDropdownOpen }"
							@click="toggleDropdown"
						>
							<text
								class="select-current-text"
								:class="{
									'placeholder-style':
										institutionList.length === 0 || selectIndex === -1,
								}"
							>
								{{
									institutionList.length > 0 && selectIndex !== -1
										? institutionList[selectIndex].institutionName
										: "暂无登录机构，请展开添加"
								}}
							</text>
							<text
								class="select-arrow"
								:class="{ 'select-arrow-rotate': isDropdownOpen }"
							></text>
						</view>

						<view
							class="custom-dropdown-list"
							:class="{ 'dropdown-show': isDropdownOpen }"
						>
							<scroll-view scroll-y class="dropdown-scroll">
								<block v-if="institutionList.length > 0">
									<view
										class="dropdown-item"
										:class="{ 'dropdown-item-selected': index === selectIndex }"
										v-for="(item, index) in institutionList"
										:key="item.id"
										@click="selectInstitution(index)"
									>
										<text class="item-name">{{ item.institutionName }}</text>
										<text class="item-check" v-if="index === selectIndex"
											>✓</text
										>
									</view>
								</block>

								<view class="dropdown-empty-tip" v-else>
									<text>暂无历史登录机构</text>
								</view>

								<view
									class="dropdown-action-item"
									@click="addInstitution"
									hover-class="dropdown-action-item-active"
								>
									<text class="add-icon">+</text>
									<text>添加并绑定新机构</text>
								</view>
							</scroll-view>
						</view>
					</view>
				</view>

				<!-- 隐私条款 -->
				<view class="privacy-wrapper">
					<checkbox-group @change="handleCheckboxChange">
						<label class="privacy-label">
							<checkbox
								:checked="isAgree"
								color="#70a9a2"
								style="transform: scale(0.7)"
							/>
							<text class="privacy-text">我已阅读并同意</text>
						</label>
					</checkbox-group>
					<text class="privacy-link" @click="openAgreement"
						>《用户服务协议》</text
					>
					<text class="privacy-text">及</text>
					<text class="privacy-link" @click="openPrivacy">《隐私政策》</text>
				</view>

				<!-- 登录按钮 -->
				<view class="btn-wrapper">
					<view class="login-btn" hover-class="none" @click="login">
						立即登录
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script setup lang="ts">
	import { onLoad } from "@dcloudio/uni-app";
	import { ref } from "vue";
	import { jump, parseData, showToast } from "@/utils/common";
	import { ROUTES } from "@/config/routes";
	import { loginByPwd, getOpenId } from "@/api/auth";
	import { useUserStore } from "@/stores/user";
	import { encryptPassword } from "@/utils/crypto";
	import {
		getInstitutionByOpenId,
		getInstitutionByCode,
	} from "@/api/institution";

	const role = ref(0);

	const account = ref("");
	const password = ref("");

	// 模拟历史机构数据（你可以从本地缓存 uni.getStorageSync('history_institutions') 中读取）
	// 如果要测试空数据状态，直接把下面的数组置为空即可：ref<Institution[]>([])
	const institutionList = ref<InstitutionResponse[]>([
		{
			id: 0,
			institutionName: "",
			institutionCode: "",
			status: 0,
			institutionAddress: "",
			createTimeStr: "",
			updateTimeStr: "",
		},
	]);

	// 修改：如果一开始就没数据，选中索引默认初始化为 -1
	const selectIndex = ref(institutionList.value.length > 0 ? 0 : -1);

	// 💡 新增：控制下拉框展开状态
	const isDropdownOpen = ref(false);

	// 💡 新增：切换下拉框展开/收起
	const toggleDropdown = () => {
		isDropdownOpen.value = !isDropdownOpen.value;
	};

	// 💡 新增：选中某个机构
	const selectInstitution = (index: number) => {
		selectIndex.value = index;
		isDropdownOpen.value = false; // 选中后自动收起
		console.log("当前选择的机构信息:", institutionList.value[index]);
	};

	// 点击最后一项的“添加机构”
	const addInstitution = async () => {
		isDropdownOpen.value = false; // 点击添加时，先收起下拉框，避免遮挡弹窗
		console.log("点击了添加机构");

		uni.showModal({
			title: "添加登录机构",
			editable: true,
			placeholderText: "请输入唯一的机构码",
			success: async (res) => {
				if (res.confirm && res.content) {
					// 💡 过滤前后空格，防止用户误输入空格导致匹配失败
					const inputCode = res.content.trim();
					if (!inputCode) {
						showToast({ msg: "机构码不能为空" });
						return;
					}

					uni.showLoading({ title: "查询中..." });

					try {
						const institution = await getInstitutionByCode({
							institutionCode: inputCode,
						});

						uni.hideLoading();

						if (institution && institution.id) {
							// 💡 核心查重逻辑：检查新机构的 id 是否已经存在于列表中
							const existingIndex = institutionList.value.findIndex(
								(item) => item.id === institution.id,
							);

							if (existingIndex !== -1) {
								// 1. 如果已经存在，直接将选择项指向它
								selectIndex.value = existingIndex;
								showToast({ msg: "该机构已在列表中，已自动为你选中" });
							} else {
								// 2. 如果不存在，才安全地推入新机构
								institutionList.value.push(institution);
								// 自动选中刚刚追加进去的最后一项
								selectIndex.value = institutionList.value.length - 1;
								showToast({ msg: "添加成功" });
							}
						} else {
							showToast({ msg: "机构码不存在" });
						}
					} catch (error) {
						uni.hideLoading();
						console.error("添加机构失败:", error);
						showToast({ msg: "网络请求失败" });
					}
				}
			},
		});
	};

	/** 是否同意用户协议 */
	const isAgree = ref(false);

	/** 打开隐私政策页面 */
	const openPrivacy = () => {
		// 假设你的路由配置里有这个页面，或者直接用 jump
		jump(ROUTES.PRIVACY);
	};

	/** 打开用户协议页面 */
	const openAgreement = () => {
		jump(ROUTES.USER_AGREEMENT); // 确保在 ROUTES 中配置了此常量
	};

	// 新增：处理勾选变化
	const handleCheckboxChange = (e: any) => {
		isAgree.value = e.detail.value.length > 0;
	};

	onLoad(async (options) => {
		if (options) {
			const data: any = parseData(options.data);
			console.log("roleId:", data.role);
			role.value = Number(data.role);
		}
		const openId = await getOpenId();
		console.log("OpenID 获取成功:", openId);

		const res = await getInstitutionByOpenId({
			openId: openId,
		});
		console.log("机构信息:", res);
		if (res) {
			institutionList.value = res;
		}
	});

	const validateForm = () => {
		// 校验账号密码是否为空
		if (!account.value || !password.value) {
			showToast({ msg: "请输入账号密码" });
			return false;
		}
		// 校验是否勾选协议
		if (!isAgree.value) {
			showToast({ msg: "请先阅读并同意《隐私条款》和《用户服务协议》" });
			return false;
		}
		// 💡 修正：如果强制要求选择机构，当索引为 -1 时拦截提示
		if (selectIndex.value === -1) {
			showToast({ msg: "请展开并选择/添加要登录的机构" });
			return false;
		}
		return true;
	};

	/** 执行登录操作 */
	const login = async () => {
		// 校验表单
		if (!validateForm()) {
			return;
		}

		// 获取当前选中的机构 ID
		const currentInstitutionId =
			institutionList.value.length > 0
				? institutionList.value[selectIndex.value].id
				: 0;

		console.log(
			"账号:",
			account.value,
			"\n密码:",
			encryptPassword(password.value),
		);

		let openId: string = await getOpenId();
		console.log("OpenID 获取成功:", openId);

		const res = await loginByPwd({
			role: role.value,
			account: account.value,
			password: encryptPassword(password.value),
			institutionId: currentInstitutionId,
			openId: openId,
			needValidateAdmin: true,
		});

		if (res.code === 200) {
			console.log("登录响应:", res);
			uni.setStorageSync("accessToken", res.data.accessToken);
			uni.setStorageSync("refreshToken", res.data.refreshToken);
			console.log("Token 已缓存");
			const userStore = useUserStore();
			userStore.setUserInfo(res.data.user);
			if (res.code === 200) {
				jump(ROUTES.MAIN_INDEX, role.value, "relaunch");
			}
		} else {
			showToast({ msg: "登录失败" });
		}
	};
</script>

<style scoped lang="scss" src="./index.scss"></style>
