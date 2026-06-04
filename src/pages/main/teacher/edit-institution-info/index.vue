<template>
	<FormPage :groups="groups" v-model:model-value="institution"></FormPage>
	<PageFooter
		:buttons="[{ text: '保存机构信息', type: 'primary' }]"
		@btnClick="submitForm"
	></PageFooter>
</template>

<script setup lang="ts">
	import FormPage from "@/components/form-page/index.vue";
	import PageFooter from "@/components/page-footer/index.vue";
	import { updateInstitution } from "@/api/institution";
	import { showToast } from "@/utils/common";
	import { usePageData } from "@/utils/common";
	import { ref, computed } from "vue";

	usePageData<InstitutionResponse>((res) => {
		console.log("URL 接收:", res);
		let resIn = res;
		institution.value = resIn;
	});

	const institution = ref<InstitutionResponse>({
		id: 0,
		status: 0,
		institutionName: "",
		institutionAddress: "",
		institutionCode: "",
		createTimeStr: "",
		updateTimeStr: "",
	});

	const groups = computed<FormGroupConfig[]>(() => [
		{
			title: "机构信息",
			mode: "edit",
			items: [
				{
					label: "机构名称",
					key: "institutionName",
					inputAlign: "right",
					type: "input",
				},
				{
					label: "机构地址",
					key: "institutionAddress",
					inputAlign: "right",
					type: "input",
				},
			],
		},
	]);

	/** 提交机构信息表单，校验后调用 updateInstitution 接口 */
	const submitForm = async () => {
		// 所有表单校验记得加上 .value
		if (!institution.value.institutionName)
			return showToast("机构名称不能为空");
		if (!institution.value.institutionAddress)
			return showToast("机构地址不能为空");

		// 调用 updateInstitution 接口
		const res = await updateInstitution({
			institutionId: institution.value.id,
			institutionName: institution.value.institutionName,
			institutionAddress: institution.value.institutionAddress,
		});
		if (res.result !== 0) {
			showToast({ msg: "更新成功" });
			uni.$emit("needRefresh");
			uni.navigateBack();
		} else {
			showToast({ msg: "更新失败" });
		}
	};
</script>

<style scoped lang="scss" src="./index.scss"></style>
