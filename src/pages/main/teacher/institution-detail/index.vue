<template>
	<view class="container">
		<FormPage :groups="groups" v-model:modelValue="institution"></FormPage>
		<PageFooter :buttons="buttons" @btn-click="toEdit" />
	</view>
</template>

<script setup lang="ts">
	import FormPage from "@/components/form-page/index.vue";
	import PageFooter from "@/components/page-footer/index.vue";
	import { getInstitutionById } from "@/api/institution";
	import { useUserStore } from "@/stores/user";
	import { onLoad } from "@dcloudio/uni-app";
	import { jump } from "@/utils/common";
	import { ROUTES } from "@/config/routes";
	import { onUnmounted, ref } from "vue";

	const userStore = useUserStore();

	const institution = ref<InstitutionResponse>({
		id: 0,
		status: 0,
		institutionName: "",
		institutionAddress: "",
		institutionCode: "",
		createTimeStr: "",
		updateTimeStr: "",
	});

	onLoad(async () => {
		console.log("onShow 开始请求接口...");
		await loadData();
	});

	const buttons = ref<FooterButton[]>([
		{
			text: "编辑信息",
			type: "primary",
		},
	]);

	const groups = ref<FormGroupConfig[]>([
		{
			title: "机构信息",
			mode: "display",
			items: [
				{
					label: "机构名称",
					key: "institutionName",
					type: "text",
				},
				{
					label: "机构地址",
					key: "institutionAddress",
					type: "text",
				},
				{
					label: "机构代码",
					key: "institutionCode",
					type: "text",
				},
			],
		},
	]);

	const toEdit = () => {
		jump(ROUTES.EDIT_INSTITUTION_INFO, institution.value);
	};

	// 2. 定义刷新数据函数
	const loadData = async () => {
		const targetId =
			userStore.userInfo?.roleId === 4
				? userStore.userInfo.identityInfo.institutionId
				: 0;

		const res = await getInstitutionById({ institutionId: targetId });

		if (res) {
			// 【修正点 2】：使用属性合并 + 浅拷贝触发响应，确保子组件能捕获到深层变化
			Object.assign(institution.value, res);
			institution.value = { ...institution.value };

			console.log("onShow 接口数据更新成功:", institution.value);
			uni.$emit("needRefreshUser");
		}
	};

	uni.$on("needRefresh", () => {
		loadData();
	});

	onUnmounted(() => {
		uni.$off("needRefresh");
	});
</script>

<style scoped lang="scss" src="./index.scss"></style>
