<template>
	<view class="search-container">
		<view class="fixed-header">
			<!-- 搜索框 -->
			<view class="header-search">
				<input
					class="search-input"
					type="text"
					:value="keyword"
					@input="onInput"
					@confirm="onSearch"
					:placeholder="placeholder"
				/>
				<button class="search-btn" @tap="onSearch">搜索</button>
			</view>

			<!-- 下拉筛选 -->
			<view class="filter-bar" v-if="filters && Object.keys(filters).length > 0">
				<view
					v-for="(config, type) in filters"
					:key="type"
					class="tab-item"
					:class="{ active: currentSelectType === type }"
					@tap="toggleDropdown(type as string)"
				>
					<text>{{ getLabel(type as string) }}</text>
					<text class="arrow" :class="{ rotate: currentSelectType === type }"
						>▼</text
					>
				</view>
			</view>

			<!-- 下拉选项内容 -->
			<view class="dropdown-content" :class="{ show: currentSelectType }">
				<view
					v-for="opt in currentOptions"
					:key="opt.value"
					class="option-item"
					:class="{ selected: activeFilters[currentSelectType] === opt.value }"
					@tap="handleSelect(opt.value)"
				>
					<text>{{ opt.label }}</text>
					<icon
						v-if="activeFilters[currentSelectType] === opt.value"
						type="success_no_circle"
						size="14"
						color="#70a9a2"
					/>
				</view>
			</view>
		</view>
		<!-- 遮罩层：使用 fixed 定位覆盖全屏 -->
		<view
			class="dropdown-mask"
			v-if="currentSelectType"
			@tap="currentSelectType = ''"
		></view>
	</view>
</template>

<script setup lang="ts">
	import { ref, computed } from "vue";

	type SearchFilterBarProps = {
		/**
		 * 搜索关键字
		 * @type string
		 * @default ""
		 */
		keyword?: string;
		/**
		 * 搜索框占位符
		 * @type string
		 * @default "请输入搜索内容"
		 */
		placeholder?: string;
		/**
		 * 筛选条件配置
		 * 这里接收下面类型的对象，详情请看这个类型的定义
		 * 这个对象负责生成不同下拉过滤选项，这里应该定义好每个选项的配置，包括 label 和 value 字段
		 * 
		 * @type FilterType
		 */
		filters?: FilterType;
		/**
		 * 对应父容器中承接选项值的地方
		 * 你应该传进来一个键值对对象， key 为你在 filter 中传入的对象中的 key ，而 value 则是默认值
		 * 当你选中对应的下拉框里的某个选项，那么会将那个选项的 value 传給这个参数传进来的对象中对应 key 的 value
		 * 简单来说就这里是你用来承接下拉框不同选项的值的
 		 * 
		 * @type ActiveFiltersType
		 */
		activeFilters?: ActiveFiltersType;
	};

	const props = withDefaults(defineProps<SearchFilterBarProps>(), {
		keyword: "",
		placeholder: "请输入搜索内容",
		filters: () => ({}),
		activeFilters: () => ({}),
	});

	const emit = defineEmits<{
		/**
		 * 搜索框输入变化触发
		 * @param value 新的搜索关键字
		 */
		(e: "update:keyword", value: string): void;

		/**
		 * 筛选条件变化触发
		 * @param value 新的筛选条件
		 */
		(e: "update:activeFilters", value: ActiveFiltersType): void;

		/**
		 * 点击搜索按钮触发
		 * @param keyword 搜索关键字
		 */
		(e: "search", keyword: string): void;

		/**
		 * 条件变化时触发
		 * @param filters 新的筛选条件
		 */
		(e: "filterChange", filters: ActiveFiltersType): void;
	}>();

	const currentSelectType = ref("");

	const currentOptions = computed(() => {
		if (!currentSelectType.value) return [];
		return props.filters[currentSelectType.value]?.options || [];
	});

	const onInput = (e: any) => {
		emit("update:keyword", e.detail.value);
	};

	const onSearch = () => {
		emit("search", props.keyword);
	};

	const toggleDropdown = (type: string) => {
		currentSelectType.value = currentSelectType.value === type ? "" : type;
	};

	const handleSelect = (value: any) => {
		const type = currentSelectType.value;
		if (type) {
			const newFilters = { ...props.activeFilters, [type]: value };
			emit("update:activeFilters", newFilters);
			currentSelectType.value = "";
			emit("filterChange", newFilters);
		}
	};

	const getLabel = (type: string) => {
		const config = props.filters[type];
		if (!config) return "";
		const currentVal = props.activeFilters[type];
		const option = config.options.find((i) => i.value === currentVal);
		return option?.label || config.label;
	};
</script>

<style lang="scss" scoped src="./index.scss">
/*
 * 使用该组件时需要在使用的页面的父容器中加上以下 css 属性
 * 
 * display: flex; 
 * min-height: 100vh;
 * flex-direction: column;
 * 
 * 同时还应该在父页面的本元素上添加一个 class 并加上如下样式
 *
 * position: sticky;
 * top: 0;
 * z-index: 100; // 确保在页面最上层
 * 
 * 
 */
</style>
