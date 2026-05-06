<template>
	<view class="container">
		<view class="header">
			<view class="user-info">
				<text class="greeting">你好 ~ 甲古书院龙文校区 蔡福全</text>
			</view>
		</view>

		<view class="menu-card">
			<view class="grid-layout">
				<template v-for="item in menuList" :key="item.id">
					<view
						v-if="item.isVisible"
						class="grid-item"
						hover-class="item-active"
						@tap="jump(item.path)"
					>
						<view class="icon-wrapper">
							<uni-icons
								v-if="item.iconType === 0"
								:type="item.icon"
								size="28"
								color="#555"
							></uni-icons>

							<image
								v-else-if="item.iconType === 1"
								:src="item.icon"
								style="width: 56rpx; height: 56rpx"
							></image>
						</view>

						<text class="menu-name">{{ item.menuName }}</text>
					</view>
				</template>
			</view>
		</view>
	</view>
</template>

<script setup lang="ts">
	import { getMenuList } from "@/api/menu";
	import { jump } from "@/utils/common";
	import { ref, onMounted } from "vue";

	// 严格按照你的 Interface 结构组织数据
	const menuList = ref<Menu[]>([]); // 根据 sortOrder 排序

	onMounted(() => {
		fetchMenus();
	});

	const fetchMenus = async () => {
		try {
			const res = await getMenuList({
				currentPage: 1,
				pageSize: 100,
			});

			console.log("菜单加载成功", res);

			// 过滤并排序
			menuList.value = res.data.menus
				.filter((m: Menu) => m.isVisible)
				.sort((a: Menu, b: Menu) => a.sortOrder - b.sortOrder);
		} catch (e) {
			console.error("菜单加载失败", e);
		}
	};
</script>

<style scoped src="./index.scss"></style>
