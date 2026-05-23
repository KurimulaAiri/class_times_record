<template>
	<view class="container">
		<view class="header">
			<view class="user-info">
				<text class="greeting"
					>欢迎 ~
					{{
						userStore.userInfo?.roleId === 4
							? userStore.userInfo.identityInfo.institution?.institutionName ||
								""
							: ""
					}}
					{{ userStore.userInfo?.identityInfo.username }}
				</text>
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
	import { getTeacherById } from "@/api/teacher";
	import { useUserStore } from "@/stores/user";
	import { ref, onMounted } from "vue";
	import { ROUTES } from "@/config/routes";

	const userStore = useUserStore();

	// 严格按照你的 Interface 结构组织数据
	const menuList = ref<MenuResponse[]>([]); // 根据 sortOrder 排序

	onMounted(async () => {
		// 1. 权限前置拦截
		if (userStore.userInfo?.roleId !== 4) {
			uni.showToast({ title: "您不是教师，非法访问", icon: "none" });
			return jump(ROUTES.LOGIN);
		}

		try {
			// 2. 准备基础数据（深拷贝一份，避免直接污染 Store 现有数据）
			const currentUser = JSON.parse(JSON.stringify(userStore.userInfo));
			const teacherId = currentUser.identityInfo?.teacherId || 0;

			// 3. 在 set 之前获取外部数据
			// 注意：这里确保解构出的 institution 是后端返回的嵌套对象
			const res = await getTeacherById(teacherId);
			const institutionData = res.institution;

			console.log("获取到的机构信息:", institutionData);

			// 4. 数据组装
			// 将获取到的机构信息注入到临时对象的 identityInfo 中
			currentUser.identityInfo = {
				...currentUser.identityInfo,
				institution: institutionData,
			};

			console.log("组装后的用户信息:", currentUser);
			// 5. 此时 currentUser 已经包含了所有数据，最后执行 set 操作
			userStore.setUserInfo(currentUser);

			// 6. 后续逻辑
			await fetchMenus();
		} catch (error) {
			console.error("获取教师信息失败", error);
			uni.showToast({ title: "信息加载失败", icon: "none" });
		}
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
				.filter((m: MenuResponse) => m.isVisible)
				.sort((a: MenuResponse, b: MenuResponse) => a.sortOrder - b.sortOrder);
		} catch (e) {
			console.error("菜单加载失败", e);
		}
	};
</script>

<style scoped src="./index.scss"></style>
