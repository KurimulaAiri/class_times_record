<!-- ============================================================
     FormGroup 组件 — 单个表单分组
     职责：渲染一个白色卡片容器，包含标题 + 配置驱动的表单项列表
     支持两种模式：edit（可编辑表单）和 display（只读信息展示）
     配合 FormPage 组件可实现多分组自动渲染
     ============================================================ -->
<template>
	<!-- 根容器：白色卡片，display 模式下追加 display-mode 类以调整内边距和圆角 -->
	<view :class="['form-group', mode === 'display' && 'display-mode']">
		<!-- 分组标题栏：仅在 title 非空时渲染 -->
		<!-- titleStyle 控制标题颜色和装饰条宽度：theme=绿色+8rpx，dark=深色+6rpx -->
		<view
			v-if="title"
			:class="[
				'group-title',
				titleStyle === 'theme' && 'title-theme',
				titleStyle === 'dark' && 'title-dark',
			]"
		>
			<slot name="title-prefix"></slot>

			<text class="title-text">{{ title }}</text>

			<text v-if="required" class="required">*</text>

			<view class="title-extra" @tap.stop="emit('titleExtraTap')">
				<slot name="title-extra"></slot>
			</view>
		</view>

		<!-- 遍历 items 配置数组，根据 type 渲染不同的表单控件 -->
		<template v-for="(item, index) in items" :key="item.key || index">
			<!-- ========== type: slot — 具名插槽 ==========
			     当 type 为 slot 时，渲染名为 item.key 的具名插槽
			     父组件可通过 <template #slotKey> 传入完全自定义的内容
			     插槽作用域提供 modelValue（表单数据）和 item（当前配置项） -->
			<slot
				v-if="item.type === 'slot'"
				name="item-slot"
				:modelValue="modelValue"
				:item="item"
			></slot>

			<!-- ========== type: text (display 模式) — 只读信息展示 ==========
			     在 display 模式下，所有非 slot 类型统一渲染为 info-item
			     label 在左，value 在右，空值时显示 emptyText 回退文本 -->
			<view
				v-else-if="mode === 'display'"
				class="info-item"
				:class="[item.itemClass, { small: item.small }]"
			>
				<text class="label">{{ item.label }}</text>
				<text class="value">{{ getDisplayValue(item) }}</text>
			</view>

			<!-- ========== type: input / number — 文本/数字输入框 ==========
			     input: 普通文本输入
			     number: type=number 的数字输入，输入值自动转为 Number 类型
			     column 为 true 时使用带边框的 input-box 纵向布局
			     inputAlign 控制文本对齐方向 -->
			<view
				v-else-if="item.type === 'input' || item.type === 'number'"
				class="form-item"
				:class="[item.itemClass, getItemClass(item)]"
			>
				<text class="label"
					>{{ item.label
					}}<text v-if="item.required" class="required">*</text></text
				>
				<view
					:class="[item.column ? 'input-box' : 'input-wrapper-flat']"
					style="flex: 1; display: flex; align-items: center"
				>
					<input
						:class="['input']"
						:type="item.type === 'number' ? 'number' : 'text'"
						:value="getValue(item.key)"
						@input="onInput(item, $event)"
						:placeholder="item.placeholder"
						placeholder-class="placeholder"
						:maxlength="item.maxLength !== undefined ? item.maxLength : 140"
					/>
				</view>
			</view>

			<!-- ========== type: textarea — 多行文本域 ==========
			     自动高度，适用于地址等长文本输入 -->
			<view
				v-else-if="item.type === 'textarea'"
				class="form-item"
				:class="[item.itemClass, getItemClass(item)]"
			>
				<text class="label"
					>{{ item.label
					}}<text v-if="item.required" class="required">*</text></text
				>
				<textarea
					class="textarea"
					:value="getValue(item.key)"
					@input="onInput(item, $event)"
					:placeholder="item.placeholder"
					placeholder-class="placeholder"
					auto-height
					:maxlength="item.maxLength"
				/>
			</view>

			<!-- ========== type: radio — 单选按钮组 ==========
			     根据 options 数组渲染多个 radio 选项
			     选中值通过 onRadioChange 写入 modelValue -->
			<view
				v-else-if="item.type === 'radio'"
				class="form-item"
				:class="[item.itemClass, getItemClass(item)]"
			>
				<text class="label"
					>{{ item.label
					}}<text v-if="item.required" class="required">*</text></text
				>
				<radio-group class="radio-group" @change="onRadioChange(item, $event)">
					<label
						class="radio-item"
						v-for="opt in item.options"
						:key="opt.value"
					>
						<radio
							class="radio"
							:value="opt.value"
							:checked="getValue(item.key) === opt.value"
							:color="themeColor"
						/>
						<text>{{ opt.label || opt.name }}</text>
					</label>
				</radio-group>
			</view>

			<!-- ========== type: date — 日期选择器 ==========
			     column 为 true 时使用带日历图标的 input-box 纵向布局
			     column 为 false 时使用行内 picker-value 样式 -->
			<view
				v-else-if="item.type === 'date'"
				class="form-item"
				:class="[item.itemClass, getItemClass(item)]"
			>
				<text class="label"
					>{{ item.label
					}}<text v-if="item.required" class="required">*</text></text
				>
				<picker
					mode="date"
					:value="getValue(item.key)"
					@change="onPickerChange(item, $event)"
				>
					<!-- 纵向布局：带日历图标和边框的输入框容器 -->
					<view v-if="item.column" class="input-box">
						<uni-icons
							type="calendar"
							size="20"
							color="#999"
							class="icon"
						></uni-icons>
						<text :class="['text', !getValue(item.key) && 'placeholder']">
							{{ getValue(item.key) || item.placeholder || "请选择日期" }}
						</text>
					</view>
					<!-- 横向布局：简单的文本显示 -->
					<view
						v-else
						:class="['picker-value', !getValue(item.key) && 'placeholder']"
					>
						{{ getValue(item.key) || item.placeholder || "请选择日期" }}
					</view>
				</picker>
			</view>

			<!-- ========== type: time — 时间选择器 ==========
			     渲染 picker mode=time，选中值通过 onPickerChange 写入 -->
			<view
				v-else-if="item.type === 'time'"
				class="form-item"
				:class="[item.itemClass, getItemClass(item)]"
			>
				<text class="label"
					>{{ item.label
					}}<text v-if="item.required" class="required">*</text></text
				>
				<picker
					mode="time"
					:value="getValue(item.key)"
					@change="onPickerChange(item, $event)"
				>
					<view :class="['picker-value', !getValue(item.key) && 'placeholder']">
						{{ getValue(item.key) || item.placeholder || "请选择时间" }}
					</view>
				</picker>
			</view>

			<!-- ========== type: picker — 点击跳转选择器 ==========
			     不使用原生 picker，而是整行可点击
			     点击时触发 pickerTap 事件，由父组件处理页面跳转逻辑
			     pickerText 用于显示已选择的内容文本 -->
			<view
				v-else-if="item.type === 'picker'"
				class="form-item"
				:class="[item.itemClass, getItemClass(item)]"
				@tap="emit('pickerTap', item.key)"
			>
				<text class="label"
					>{{ item.label
					}}<text v-if="item.required" class="required">*</text></text
				>
				<view class="picker-value-wrapper">
					<text :class="['picker-value', !getValue(item.key) && 'placeholder']">
						{{ item.pickerText || item.placeholder || "请选择" }}
					</text>
					<!-- 右箭头图标，提示可点击跳转 -->
					<uni-icons type="right" size="14" color="#ccc"></uni-icons>
				</view>
			</view>

			<!-- ========== type: stepper — 数字步进器 ==========
			     包含减号按钮、数字输入框、加号按钮
			     min/max 限制数值范围 -->
			<view
				v-else-if="item.type === 'stepper'"
				class="form-item"
				:class="[item.itemClass, getItemClass(item)]"
			>
				<text class="label"
					>{{ item.label
					}}<text v-if="item.required" class="required">*</text></text
				>
				<view class="stepper">
					<!-- 减号按钮 -->
					<view class="step-btn" @tap="onStepperChange(item, -1)">-</view>
					<!-- 数值输入框 -->
					<input
						class="step-input"
						type="number"
						:value="getValue(item.key)"
						@input="onInput(item, $event)"
					/>
					<!-- 加号按钮 -->
					<view class="step-btn" @tap="onStepperChange(item, 1)">+</view>
				</view>
			</view>

			<!-- ========== type: avatar — 头像选择 ==========
			     点击整行触发 uni.chooseImage 选择图片
			     有头像时显示图片，无头像时显示相机图标 -->
			<view
				v-else-if="item.type === 'avatar'"
				class="form-item avatar-section"
				@tap="onChooseAvatar(item)"
			>
				<text class="label">{{ item.label }}</text>
				<view class="right-content">
					<view class="avatar-wrapper">
						<!-- 已选择头像时显示图片 -->
						<image
							v-if="getValue(item.key)"
							:src="getValue(item.key)"
							mode="aspectFill"
							class="avatar-img"
						></image>
						<!-- 未选择头像时显示相机占位图标 -->
						<uni-icons v-else type="camera" size="30" color="#999"></uni-icons>
					</view>
					<!-- 右箭头提示可点击 -->
					<uni-icons type="right" size="18" color="#ccc"></uni-icons>
				</view>
			</view>
		</template>

		<!-- 默认插槽：在 items 渲染之后追加的自定义内容区域
		     适用于 add-placeholder（添加按钮）、schedule-card-item（日程卡片）等
		     无法通过配置驱动实现的复杂自定义内容 -->
		<slot></slot>
	</view>
</template>

<script setup lang="ts">
	import { ref, watch } from "vue";

	/**
	 * FormGroup 组件的 Props 类型定义
	 */
	type FormGroupProps = {
		/** 分组标题文本，为空时不渲染标题栏 */
		title?: string;
		/**
		 * 分组模式：
		 * - "edit": 编辑模式，渲染可交互的表单控件
		 * - "display": 展示模式，渲染只读的 info-item
		 */
		mode?: "edit" | "display";
		/**
		 * 标题样式风格：
		 * - "theme": 主题色标题（绿色 + 8rpx 装饰条）
		 * - "dark": 深色标题（#333 + 6rpx 装饰条）
		 */
		titleStyle?: "theme" | "dark";
		/** 标题后是否显示红色 * 必填标记 */
		required?: boolean;
		/** 表单项配置数组，每项描述一行表单控件的渲染方式 */
		items?: FormItemConfig[];
		/** 表单数据对象，组件通过 key 路径从中读取和写入字段值 */
		modelValue?: Record<string, any>;
		/** 主题色，用于 radio 选中颜色等，默认 "#70a9a2" */
		themeColor?: string;
	};

	const props = withDefaults(defineProps<FormGroupProps>(), {
		title: "",
		mode: "edit",
		titleStyle: "theme",
		required: false,
		items: () => [],
		modelValue: () => ({}),
		themeColor: "#70a9a2",
	});

	const emit = defineEmits<{
		/**
		 * 字段值变更事件
		 * @param payload.key - 变更的字段路径
		 * @param payload.value - 变更后的新值
		 */
		(e: "change", payload: { key: string; value: any }): void;
		/**
		 * picker 类型点击事件
		 * @param key - 被点击的表单项的 key，父组件据此判断跳转目标
		 */
		(e: "pickerTap", key: string): void;
		/**
		 * modelValue 双向绑定更新事件
		 * @param value - 更新后的完整表单数据对象
		 */
		(e: "update:modelValue", value: Record<string, any>): void;
		/** 新增：标题右侧额外区域点击事件
		 */
		(e: "titleExtraTap"): void;
	}>();

	/**
	 * 组件内部维护的表单影子对象
	 * 用户输入时直接修改此局部对象，避免频繁触发外层引用重构
	 * 解决微信小程序中因 Diff 比对导致的输入卡顿问题
	 */
	const localForm = ref<Record<string, any>>({});

	/**
	 * 监听外层传入的 modelValue，同步到内部 localForm
	 * 采用浅拷贝断开引用，防止子组件和父组件共享同一内存地址导致通知错乱
	 * 注意：不开启 deep 监听，否则输入时会反复触发同步
	 */
	watch(
		() => props.modelValue,
		(newVal) => {
			localForm.value = newVal ? { ...newVal } : {};
		},
		{ immediate: true, deep: false },
	);

	/**
	 * 根据字段路径从 localForm 中读取值
	 * 支持点号嵌套访问，如 "primaryParent.username"
	 * @param key - 字段路径，如 "studentName" 或 "primaryParent.phone"
	 * @returns 字段值，不存在时返回空字符串
	 */
	const getValue = (key: string): any => {
		return (
			key.split(".").reduce((obj: any, k) => obj?.[k], localForm.value) ?? ""
		);
	};

	/**
	 * 将值写入 localForm 的指定字段路径，并通知父组件
	 * 支持点号嵌套路径，中间路径不存在时自动创建空对象
	 * 写入后将 localForm 的深拷贝副本通过 update:modelValue 事件抛出
	 * @param key - 字段路径
	 * @param value - 要写入的值
	 */
	const setValue = (key: string, value: any): void => {
		const keys = key.split(".");
		const lastKey = keys.pop()!;

		let current = localForm.value;

		for (let i = 0; i < keys.length; i++) {
			const k = keys[i];
			if (!current[k] || typeof current[k] !== "object") {
				current[k] = {};
			}
			current = current[k];
		}

		if (current) {
			current[lastKey] = value;

			const outData = JSON.parse(JSON.stringify(localForm.value));
			emit("update:modelValue", outData);
			emit("change", { key, value });
		}
	};

	/**
	 * input/number/stepper 输入事件处理
	 * number 和 stepper 类型自动将输入值转为 Number 类型
	 * @param item - 触发输入的表单项配置
	 * @param e - 输入事件对象，e.detail.value 为输入值
	 */
	const onInput = (item: FormItemConfig, e: any): void => {
		let val = e.detail.value;
		if (item.type === "number" || item.type === "stepper") {
			val = val === "" ? "" : isNaN(Number(val)) ? val : Number(val);
		}
		setValue(item.key, val);
	};

	/**
	 * 根据 FormItemConfig 生成 form-item 的动态 class 对象
	 * @param item - 表单项配置
	 * @returns 包含 no-border/block-item/column 的 class 映射对象
	 */
	const getItemClass = (item: FormItemConfig): Record<string, boolean> => ({
		"no-border": item.noBorder ?? false,
		"block-item": item.block ?? false,
		column: item.column ?? false,
		"align-right": item.inputAlign === "right",
	});

	/**
	 * 获取 display 模式下的展示值
	 * 字段值为空（null/undefined/空字符串）时返回 emptyText 回退文本
	 * @param item - 表单项配置
	 * @returns 展示文本，空值时返回 item.emptyText 或 "未填写"
	 */
	const getDisplayValue = (item: FormItemConfig): string => {
		const val = getValue(item.key);
		if (val === "" || val === null || val === undefined) {
			return item.emptyText || "未填写";
		}

		// 核心改动：如果配置项里有自定义的 format 转换函数，则用它格式化
		if (typeof item.format === "function") {
			return item.format(val);
		}
		return String(val);
	};

	/**
	 * radio 单选变更事件处理
	 * radio 的 value 为字符串，自动转为 Number 后写入
	 * @param item - 触发变更的表单项配置
	 * @param e - radio-group 的 change 事件对象
	 */
	const onRadioChange = (item: FormItemConfig, e: any): void => {
		setValue(item.key, Number(e.detail.value));
	};

	/**
	 * 日期/时间选择器变更事件处理
	 * 直接将选择器的值写入对应字段
	 * @param item - 触发变更的表单项配置
	 * @param e - picker 的 change 事件对象，e.detail.value 为选中值
	 */
	const onPickerChange = (item: FormItemConfig, e: any): void => {
		setValue(item.key, e.detail.value);
	};

	/**
	 * 步进器加减按钮点击处理
	 * 在当前值基础上增减 delta，受 min/max 限制
	 * @param item - 触发变更的表单项配置
	 * @param delta - 增量值，+1 或 -1
	 */
	const onStepperChange = (item: FormItemConfig, delta: number): void => {
		const current = getValue(item.key) || 0;
		const next = current + delta;
		if (item.min !== undefined && next < item.min) return;
		if (item.max !== undefined && next > item.max) return;
		setValue(item.key, next);
	};

	/**
	 * 头像选择处理
	 * 调用 uni.chooseImage 选择图片，将临时路径写入对应字段
	 * @param item - 头像表单项配置
	 */
	const onChooseAvatar = (item: FormItemConfig): void => {
		uni.chooseImage({
			count: 1,
			success: (res) => {
				setValue(item.key, res.tempFilePaths[0]);
			},
		});
	};
</script>

<style lang="scss" scoped src="./index.scss"></style>
