<template>
	<view :class="['form-group', mode === 'display' && 'display-mode']">
		<view
			v-if="title"
			:class="[
				'group-title',
				titleStyle === 'theme' && 'title-theme',
				titleStyle === 'dark' && 'title-dark',
			]"
		>
			<slot name="title-prefix"></slot>
			{{ title }}
			<text v-if="required" class="required">*</text>
		</view>

		<template v-for="(item, index) in items" :key="item.key || index">
			<slot
				v-if="item.type === 'slot'"
				:name="item.key"
				:modelValue="modelValue"
				:item="item"
			></slot>

			<view
				v-else-if="mode === 'display'"
				class="info-item"
				:class="[item.itemClass, { small: item.small }]"
			>
				<text class="label">{{ item.label }}</text>
				<text class="value">{{ getDisplayValue(item) }}</text>
			</view>

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
						:class="[
							'input',
							!item.column && item.inputAlign === 'right' && 'input-right',
						]"
						:type="item.type === 'number' ? 'number' : 'text'"
						:value="getValue(item.key)"
						@input="onInput(item, $event)"
						:placeholder="item.placeholder"
						placeholder-class="placeholder"
						:maxlength="item.maxlength !== undefined ? item.maxlength : 140"
					/>
				</view>
			</view>

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
					:maxlength="item.maxlength"
				/>
			</view>

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
							:value="opt.value"
							:checked="getValue(item.key) === opt.value"
							:color="themeColor"
						/>
						<text>{{ opt.label || opt.name }}</text>
					</label>
				</radio-group>
			</view>

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
					<view
						v-else
						:class="['picker-value', !getValue(item.key) && 'placeholder']"
					>
						{{ getValue(item.key) || item.placeholder || "请选择日期" }}
					</view>
				</picker>
			</view>

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
					<uni-icons type="right" size="14" color="#ccc"></uni-icons>
				</view>
			</view>

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
					<view class="step-btn" @tap="onStepperChange(item, -1)">-</view>
					<input
						class="step-input"
						type="number"
						:value="getValue(item.key)"
						@input="onInput(item, $event)"
					/>
					<view class="step-btn" @tap="onStepperChange(item, 1)">+</view>
				</view>
			</view>

			<view
				v-else-if="item.type === 'avatar'"
				class="form-item avatar-section"
				@tap="onChooseAvatar(item)"
			>
				<text class="label">{{ item.label }}</text>
				<view class="right-content">
					<view class="avatar-wrapper">
						<image
							v-if="getValue(item.key)"
							:src="getValue(item.key)"
							mode="aspectFill"
							class="avatar-img"
						></image>
						<uni-icons v-else type="camera" size="30" color="#999"></uni-icons>
					</view>
					<uni-icons type="right" size="18" color="#ccc"></uni-icons>
				</view>
			</view>
		</template>

		<slot></slot>
	</view>
</template>

<script setup lang="ts">
	import { ref, watch } from "vue";

	type FormGroupProps = {
		title?: string;
		mode?: "edit" | "display";
		titleStyle?: "theme" | "dark";
		required?: boolean;
		items?: FormItemConfig[];
		modelValue?: Record<string, any>;
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
		(e: "change", payload: { key: string; value: any }): void;
		(e: "pickerTap", key: string): void;
		(e: "update:modelValue", value: Record<string, any>): void;
	}>();

	// 💡 核心改良点 1：在组件内部维护一个属于自己的表单影子对象
	// 这样用户打字时，我们直接修改这个局部对象，绝不触发外层引用重构，彻底避开微信小程序的 Diff 锁
	const localForm = ref<Record<string, any>>({});

	// 监听外层传入的初始数据或外部异步重置
	watch(
		() => props.modelValue,
		(newVal) => {
			if (newVal) {
				// 采用浅拷贝防止子组件和父组件直接共享一个内存地址导致通知错乱
				localForm.value = { ...newVal };
			}
		},
		{ immediate: true, deep: false }, // 注意：千万不要开启 deep 监听，否则打字时又会反复触发
	);

	// 💡 核心改良点 2：读取和写入全部转为操作内部局部变量
	const getValue = (key: string): any => {
		return (
			key.split(".").reduce((obj: any, k) => obj?.[k], localForm.value) ?? ""
		);
	};

	const setValue = (key: string, value: any): void => {
		const keys = key.split(".");
		const lastKey = keys.pop()!;

		let current = localForm.value;

		// 在局部影子对象中安全钻取并赋值
		for (let i = 0; i < keys.length; i++) {
			const k = keys[i];
			if (!current[k] || typeof current[k] !== "object") {
				current[k] = {};
			}
			current = current[k];
		}

		if (current) {
			current[lastKey] = value;

			// 💡 核心改良点 3：抛出给父组件时，为了应对深层嵌套，打包一个干净的副本抛上去
			// 此时父组件的数据更新了，但由于 watch 没开 deep，它不会反向冲刷子组件的 localForm，打字流非常丝滑！
			const outData = JSON.parse(JSON.stringify(localForm.value));
			emit("update:modelValue", outData);
			emit("change", { key, value });
		}
	};

	const onInput = (item: FormItemConfig, e: any): void => {
		let val = e.detail.value;
		if (item.type === "number" || item.type === "stepper") {
			val = val === "" ? "" : isNaN(Number(val)) ? val : Number(val);
		}
		setValue(item.key, val);
	};

	const getItemClass = (item: FormItemConfig): Record<string, boolean> => ({
		"no-border": item.noBorder ?? false,
		"block-item": item.block ?? false,
		column: item.column ?? false,
	});

	const getDisplayValue = (item: FormItemConfig): string => {
		const val = getValue(item.key);
		if (val === "" || val === null || val === undefined) {
			return item.emptyText || "未填写";
		}
		return String(val);
	};

	const onRadioChange = (item: FormItemConfig, e: any): void => {
		setValue(item.key, Number(e.detail.value));
	};

	const onPickerChange = (item: FormItemConfig, e: any): void => {
		setValue(item.key, e.detail.value);
	};

	const onStepperChange = (item: FormItemConfig, delta: number): void => {
		const current = getValue(item.key) || 0;
		const next = current + delta;
		if (item.min !== undefined && next < item.min) return;
		if (item.max !== undefined && next > item.max) return;
		setValue(item.key, next);
	};

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
