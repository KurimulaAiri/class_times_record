<!-- ============================================================
     PageFooter 组件 — 页面底部漂浮操作栏
     职责：渲染固定在页面底部的操作按钮区域
     支持三种布局模式：
       1. 单按钮：居中显示一个主题色按钮（如"保存"、"创建"）
       2. 多按钮：横向排列多个按钮（如"取消"+"确认"）
       3. 信息+按钮：左侧显示提示信息，右侧显示操作按钮（如"已选3人"+"确认选择"）
     ============================================================ -->
<template>
	<!-- 根容器：fixed 为 true 时使用 fixed 定位漂浮在页面底部 -->
	<view :class="['page-footer', fixed && 'page-footer-fixed']">
		<!-- 左侧信息区域：仅在 info 非空时渲染
		     适用于多选场景，显示"已选 N 人"等提示文本 -->
		<view v-if="info" class="footer-info">
			<!-- info 文本中用 {{count}} 占位符表示数量，渲染时替换为主题色高亮数字 -->
			<template v-for="(segment, i) in infoSegments" :key="i">
				<text v-if="segment.type === 'text'" class="info-text">{{
					segment.content
				}}</text>
				<text v-else class="info-count">{{ segment.content }}</text>
			</template>
		</view>

		<!-- 按钮区域：根据 buttons 数量自动切换布局 -->
		<view :class="['footer-buttons', `buttons-${buttons.length}`]">
			<view
				v-for="(btn, index) in buttons"
				:key="index"
				:class="[
					'footer-btn',
					`btn-${btn.type || 'primary'}`,
					btn.disabled && 'btn-disabled',
				]"
				hover-class="btn-hover"
				hover-stay-time="50"
				@tap="!btn.disabled && emit('btnClick', index)"
			>
				{{ btn.text }}
			</view>
		</view>

		<!-- 默认插槽：用于完全自定义底部内容（不常用） -->
		<slot></slot>
	</view>
</template>

<script setup lang="ts">
	import { computed } from "vue";

	/**
	 * PageFooter 组件的 Props 类型定义
	 */
	type PageFooterProps = {
		/**
		 * 按钮配置数组
		 * - 1 个按钮：居中显示，占满宽度
		 * - 2 个按钮：左右排列，主按钮占更大比例
		 * - 3+ 个按钮：等宽排列
		 */
		buttons?: FooterButton[];

		/**
		 * 左侧信息文本，支持 {{count}} 占位符
		 * 占位符会被替换为主题色高亮数字
		 * 例如："已选 {{count}} 人" → "已选 3 人"（3 为主题色）
		 * 为空时不显示信息区域，按钮占满宽度
		 */
		info?: string;

		/**
		 * 信息文本中 {{count}} 占位符替换的数值
		 * 仅在 info 包含 {{count}} 时有效
		 */
		count?: number;

		/**
		 * 是否使用 fixed 定位漂浮在页面底部
		 * - true: 固定在底部，带顶部阴影和安全区适配（表单提交页）
		 * - false: 普通文档流布局（详情页底部按钮）
		 */
		fixed?: boolean;
	};

	const props = withDefaults(defineProps<PageFooterProps>(), {
		buttons: () => [{ text: "确定", type: "primary" }],
		info: "",
		count: 0,
		fixed: true,
	});

	const emit = defineEmits<{
		/**
		 * 按钮点击事件
		 * @param index - 被点击按钮在 buttons 数组中的索引
		 */
		(e: "btnClick", index: number): void;
	}>();

	/**
	 * 将 info 文本按 {{count}} 占位符拆分为片段数组
	 * 每个片段标记为 'text'（普通文本）或 'count'（高亮数字）
	 * 例如："已选 {{count}} 人" → [{ type: 'text', content: '已选 ' }, { type: 'count', content: '3' }, { type: 'text', content: ' 人' }]
	 */
	const infoSegments = computed(() => {
		if (!props.info) return [];
		const parts = props.info.split("{{count}}");
		const segments: { type: "text" | "count"; content: string }[] = [];
		parts.forEach((part, i) => {
			if (part) {
				segments.push({ type: "text", content: part });
			}
			if (i < parts.length - 1) {
				segments.push({ type: "count", content: String(props.count) });
			}
		});
		return segments;
	});
</script>

<style lang="scss" scoped src="./index.scss"></style>
