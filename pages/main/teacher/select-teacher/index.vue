<template>
	<view class="selector-page">
		<view class="search-bar">
			<input v-model="keyword" placeholder="输入姓名搜索老师" />
		</view>

		<checkbox-group class="list-container" @change="onCheckChange">
			<label class="teacher-item" v-for="item in filteredList" :key="item.id">
				<view class="avatar">{{ item.name.charAt(0) }}</view>
				<view class="name">{{ item.name }}</view>
				<checkbox
					:value="item.id.toString()"
					:checked="item.checked"
					color="#2979ff"
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

	const themeColor = "#2979ff";
	const keyword = ref("");
	const tempIds = ref([]);
	const list = ref([
		{ id: 101, name: "张旭老师" },
		{ id: 102, name: "王梦老师" },
		{ id: 103, name: "李静老师" },
	]);

	onLoad((opt) => {
		if (opt.ids) {
			tempIds.value = opt.ids.split(",");
			list.value.forEach(
				(t) => (t.checked = tempIds.value.includes(t.id.toString())),
			);
		}
	});

	const filteredList = computed(() =>
		list.value.filter((t) => t.name.includes(keyword.value)),
	);

	const onCheckChange = (e) => {
		tempIds.value = e.detail.value;
	};

	const confirm = () => {
		const result = list.value.filter((t) =>
			tempIds.value.includes(t.id.toString()),
		);
		uni.$emit("updateTeachers", result);
		uni.navigateBack();
	};
</script>

<style lang="scss" scoped src="./index.scss"></style>
