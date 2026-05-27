<template>
	<view class="container">
		<FormPage :groups="groups" :model-value="institution"> </FormPage>
		<PageFooter :buttons="buttons" @btn-click="toEdit" />
	</view>
</template>

<script setup lang="ts">
	import FormPage from "@/components/form-page/index.vue";
	import PageFooter from "@/components/page-footer/index.vue";
	import { useUserStore } from "@/stores/user";
	import { onLoad } from "@dcloudio/uni-app";
	import { jump } from "@/utils/common";
	import { ROUTES } from "@/config/routes";
	import { ref } from "vue";

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

	onLoad(() => {
		if (userStore.userInfo?.roleId === 4) {
			institution.value = userStore.userInfo.identityInfo.institution;
			console.log("institution.value:", institution.value);
		}

		console.log("onLoad 执行");
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
		jump(ROUTES.EDIT_INSTITUTION, { institution: institution.value });
	};
</script>

<style scoped lang="scss" src="./index.scss"></style>
