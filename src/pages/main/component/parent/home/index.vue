<template>
	<view class="container">
		<view class="banner-box">
			<view class="banner-content">
				<view class="title">你好 ~</view>
				<view class="sub-title"
					>{{
						studentStore.studentInfo?.institutions
							?.map((inst) => inst.institutionName)
							.join("、") || "未绑定任何课程"
					}}
					{{ studentStore.studentInfo?.studentName || "未绑定学员" }}</view
				>
				<view class="tag">今日共有 114514 节课程待处理</view>
			</view>
			<image
				class="banner-img"
				src="/static/icon/book-4-white.svg"
				mode="aspectFit"
			></image>
		</view>

		<view class="grid-container">
			<template v-for="item in menuList" :key="item.id">
				<view
					v-if="item.isVisible"
					class="grid-item"
					@tap="jump(item.path)"
					hover-class="item-hover"
				>
					<view
						class="icon-wrapper"
						:style="{ backgroundColor: item.bgColor || '#66cdaa' }"
					>
						<uni-icons
							v-if="item.iconType === 0"
							:type="item.icon"
							size="28"
							color="#fff"
						></uni-icons>
						<image
							v-if="item.iconType === 1"
							:src="item.icon"
							class="custom-icon"
						></image>
					</view>
					<text class="grid-label">{{ item.menuName }}</text>
				</view>
			</template>
		</view>
	</view>
</template>

<script setup lang="ts">
	import { ref, onMounted } from "vue";
	import { getMenuList } from "@/api/menu";
	import { jump } from "@/utils/common";
	import { useStudentStore } from "@/stores/student";

	const studentStore = useStudentStore();

	const menuList = ref<MenuResponse[]>([]);

	onMounted(() => {
		fetchMenus();
	});

	const fetchMenus = async () => {
		try {
			const res = await getMenuList({
				currentPage: 1,
				pageSize: 100,
			});
			// 过滤并排序
			menuList.value = res.data.menus
				.filter((m: MenuResponse) => m.isVisible)
				.sort((a: MenuResponse, b: MenuResponse) => a.sortOrder - b.sortOrder);
		} catch (e) {
			console.error("菜单加载失败", e);
		}
	};
</script>

<style scoped lang="scss" src="./index.scss"></style>
