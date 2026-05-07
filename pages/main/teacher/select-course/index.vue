<template>
	<view class="selector-page">
		<view class="search-bar">
			<icon type="search" size="14" color="#999" />
			<input v-model="keyword" placeholder="搜索课程名称" />
		</view>

		<scroll-view scroll-y class="list-container">
			<view
				class="course-item"
				v-for="item in filteredList"
				:key="item.id"
				@tap="select(item)"
			>
				<view class="course-icon">📚</view>
				<view class="course-info">
					<text class="name">{{ item.name }}</text>
					<text class="desc">{{ item.type }}</text>
				</view>
				<uni-icons type="right" size="14" color="#eee"></uni-icons>
			</view>
		</scroll-view>
	</view>
</template>

<script setup lang="ts">
	import { ref, computed } from "vue";

	const keyword = ref("");
	const list = ref([
		{ id: 1, name: "素描基础理论", type: "美术类" },
		{ id: 2, name: "少儿创意水彩", type: "美术类" },
		{ id: 3, name: "钢琴考级特训", type: "乐器类" },
	]);

	const filteredList = computed(() =>
		list.value.filter((i) => i.name.includes(keyword.value)),
	);

	const select = (item) => {
		uni.$emit("updateCourse", item);
		uni.navigateBack();
	};
</script>

<style lang="scss" scoped src="./index.scss"></style>
