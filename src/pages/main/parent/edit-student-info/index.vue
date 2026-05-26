<template>
	<view class="container">
		<FormGroup
			mode="edit"
			:items="formItems"
			v-model:modelValue="submitData"
		></FormGroup>

		<PageFooter :buttons="[{ text: '保存', type: 'primary' }]" @btnClick="submitForm"></PageFooter>
	</view>
</template>

<script setup lang="ts">
	import { ref } from "vue";
	import { onLoad } from "@dcloudio/uni-app";
	import { updateStudentInfo } from "@/api/student";
	import { parseData, showToast } from "@/utils/common";
	import FormGroup from "@/components/form-group/index.vue";
	import PageFooter from "@/components/page-footer/index.vue";

	/** 表单项配置列表 */
	const formItems: FormItemConfig[] = [
		{ key: "avatar", label: "学员头像", type: "avatar" },
		{
			key: "birth",
			label: "出生日期",
			type: "date",
			column: true,
			placeholder: "选择日期",
		},
		{
			key: "school",
			label: "就读学校",
			type: "input",
			column: true,
			placeholder: "请输入",
		},
		{
			key: "address",
			label: "家庭住址",
			type: "input",
			column: true,
			placeholder: "请输入",
		},
	];

	onLoad((options) => {
		if (options) {
			const data: StudentResponse | undefined = parseData(options.data);
			console.log("studentList:", data);

			submitData.value = {
				id: data?.id || 0,
				avatar: data?.avatar || "",
				birth: data?.birthStr || "",
				school: data?.school || "",
				address: data?.address || "",
			};
		}
	});

	/** 提交用的学生数据 */
	const submitData = ref<SubmitUpdateStudentInfoRequest>({
		id: 0,
		avatar: "",
		birth: "",
		school: "",
		address: "",
	});

	/** 提交修改后的学生信息 */
	const submitForm = () => {
		uni.showLoading({ title: "保存中..." });
		console.log("submitData:", submitData.value);

		if (
			submitData.value.birth === "" ||
			submitData.value.birth === undefined ||
			submitData.value.birth === "暂无记录"
		) {
			uni.hideLoading();
			showToast("请选择出生日期", "error");
			return;
		}

		if (
			submitData.value.school === "" ||
			submitData.value.school === undefined
		) {
			uni.hideLoading();
			showToast("请输入就读学校", "error");
			return;
		}

		if (
			submitData.value.address === "" ||
			submitData.value.address === undefined
		) {
			uni.hideLoading();
			showToast("请输入家庭住址", "error");
			return;
		}

		updateStudentInfo(submitData.value).then((res) => {
			if (res.code === 200) {
				uni.hideLoading();
				showToast("保存成功", "success");
				setTimeout(() => {
					uni.navigateBack();
				}, 1000);
			} else {
				uni.hideLoading();
				showToast(res.message || "保存失败", "error");
			}
		});
	};
</script>

<style lang="scss" scoped src="./index.scss"></style>
