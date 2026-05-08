<template>
	<view class="selector-page">
		<view class="search-bar">
			<input v-model="keyword" placeholder="输入姓名搜索老师" @tap="handleSearch" />
		</view>

		<checkbox-group class="list-container" @change="onCheckChange">
			<label
				class="teacher-item"
				v-for="item in list"
				:key="item.teacherId"
			>
				<view class="avatar">{{ item.username.charAt(0) }}</view>
				<view class="name">{{ item.username }}</view>
				<checkbox
					:value="item.teacherId.toString()"
					:checked="tempIds.indexOf(item.teacherId.toString()) !== -1"
					color="#92DCD3"
				/>
			</label>
		</checkbox-group>

		<view class="confirm-bar">
			<view class="count"
				>已选：<text :style="{ color: themeColor }">{{
					tempIds.length
				}}</text></view
			>
			<button class="btn" @tap="confirm">确认选择</button>
		</view>
	</view>
</template>

<script setup lang="ts">
	import { ref, computed } from "vue";
	import { onLoad } from "@dcloudio/uni-app";
	import { getTeachersByInstitutionId } from "@/api/teacher";
	import { useUserStore } from "@/stores/user";
	import { parseData } from "@/utils/common";

	const userStore = useUserStore();

	const themeColor = "#2979ff";
	const keyword = ref("");
	const tempIds = ref<string[]>([]);
	const list = ref<TeacherResponse[]>([]);
	const currentPage = ref(1);
	const pageSize = ref(100);

	onLoad(async (opt) => {
		console.log("opt", opt);

		if (!opt) {
			return;
		}

		if (opt) {
			const res = parseData(opt.data);
			console.log("传入的老师ID", res);
			console.log("传入的老师ID，去除空格", res.split(","));

			if (res) {
				tempIds.value = res.split(",").filter((id) => id && id.trim() !== "");
			} else {
				tempIds.value = [];
			}

			tempIds.value = res.split(",");

			console.log("tempIds", tempIds.value);
		}

		let institutionId =
			userStore.userInfo?.roleId === 4
				? userStore.userInfo?.identityInfo.institutionId
				: 0;

		console.log("institutionId", institutionId);

		const res = await getTeachersByInstitutionId({
			institutionId: institutionId,
			currentPage: currentPage.value,
			pageSize: pageSize.value,
		});
		list.value = res.teachers || [];
		console.log("老师列表", list.value);
	});

	const onCheckChange = (e: any) => {
		console.log("e.detail.value", e.detail.value);
		tempIds.value = e.detail.value;
		console.log("选中后当前tempIds", tempIds.value);
	};

	const confirm = () => {
		const result = list.value.filter((t) =>
			tempIds.value.includes(t.teacherId.toString()),
		);
		uni.$emit("updateTeachers", result);
		uni.navigateBack();
	};

	const handleSearch = () => {
		currentPage.value = 1;
		// TODO 请求后端
		console.log("搜索后当前list", list.value);
	};
</script>

<style lang="scss" scoped src="./index.scss"></style>
