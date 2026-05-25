<!-- ============================================================
     FormPage 组件 — 多表单分组容器
     职责：根据 groups 配置数组自动渲染多个 FormGroup
     页面只需引入一个 FormPage 组件，通过 groups 配置即可生成完整的表单页面
     支持两种插槽：
       - group-{index}: 第 N 个 FormGroup 的默认插槽（追加自定义内容）
       - group-{index}-{key}: 第 N 个 FormGroup 内 type:'slot' 项的具名插槽
     ============================================================ -->
<template>
	<view class="form-page">
		<!-- 遍历 groups 配置数组，为每个分组渲染一个 FormGroup -->
		<FormGroup
			v-for="(group, index) in groups"
			:key="index"
			:title="group.title"
			:titleStyle="group.titleStyle || 'theme'"
			:mode="group.mode || 'edit'"
			:required="group.required || false"
			:items="group.items || []"
			:modelValue="modelValue"
			@update:modelValue="
				(val) => {
					emit('update:modelValue', val);
				}
			"
			:themeColor="themeColor"
			@change="(payload) => emit('change', payload)"
			@pickerTap="(key) => emit('pickerTap', key)"
		>
			<!-- 动态透传 type:'slot' 项的具名插槽
			     将 FormGroup 内部 #key 插槽桥接到 FormPage 的 #group-{index}-{key} 插槽
			     例如：FormGroup 内 type:'slot' key:'teachers' 的项
			           → FormPage 使用 #group-0-teachers 插槽传入自定义内容 -->
			<template v-for="item in getSlotItems(group)" :key="item.key">
				<slot :name="`group-${index}-${item.key}`"></slot>
			</template>

			<!-- 透传每个 FormGroup 的默认插槽
			     命名为 group-{index}，用于在 items 渲染之后追加自定义内容
			     例如：#group-1 可在第 2 个分组底部添加日程卡片等复杂内容
			     作用域提供 model（表单数据）和 group（当前分组配置） -->
			<slot :name="`group-${index}`" :model="modelValue" :group="group"></slot>
		</FormGroup>
	</view>
</template>

<script setup lang="ts">
	import FormGroup from "@/components/form-group/index.vue";

	/**
	 * FormPage 组件的 Props 类型定义
	 */
	type FormPageProps = {
		/**
		 * 表单分组配置数组
		 * 每个元素描述一个 FormGroup 的渲染参数（标题、样式、模式、表单项列表）
		 * 数组顺序即为页面上的渲染顺序
		 */
		groups: FormGroupConfig[];
		/**
		 * 表单数据对象，会传递给每个 FormGroup 作为 modelValue
		 * FormGroup 通过 key 路径从中读取和写入字段值
		 */
		modelValue?: Record<string, any>;
		/**
		 * 主题色，透传给每个 FormGroup
		 * 用于 radio 选中颜色、步进器等控件的主题色
		 * 默认 "#70a9a2"
		 */
		themeColor?: string;
	};

	const props = withDefaults(defineProps<FormPageProps>(), {
		modelValue: () => ({}),
		themeColor: "#70a9a2",
	});

	const emit = defineEmits<{
		/**
		 * 字段值变更事件（透传自 FormGroup）
		 * @param payload.key - 变更的字段路径
		 * @param payload.value - 变更后的新值
		 */
		(e: "change", payload: { key: string; value: any }): void;
		/**
		 * picker 类型点击事件（透传自 FormGroup）
		 * @param key - 被点击的表单项的 key，父组件据此判断跳转目标
		 */
		(e: "pickerTap", key: string): void;
		/**
		 * modelValue 双向绑定更新事件（透传自 FormGroup）
		 * @param value - 更新后的完整表单数据对象
		 */
		(e: "update:modelValue", value: Record<string, any>): void;
	}>();

	/**
	 * 从分组配置中筛选出 type 为 'slot' 的表单项
	 * 这些项需要通过具名插槽由父组件提供自定义内容
	 * @param group - 分组配置对象
	 * @returns 需要插槽的表单项配置数组
	 */
	const getSlotItems = (group: FormGroupConfig): FormItemConfig[] => {
		return (group.items || []).filter((item) => item.type === "slot");
	};
</script>

<style scoped lang="scss" src="./index.scss"></style>
