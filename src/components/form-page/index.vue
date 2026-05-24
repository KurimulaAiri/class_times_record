<template>
	<view class="form-page">
		<FormGroup
			v-for="(group, index) in groups"
			:key="index"
			:title="group.title"
			:titleStyle="group.titleStyle || 'theme'"
			:mode="group.mode || 'edit'"
			:required="group.required || false"
			:items="group.items || []"
			:modelValue="modelValue"
			:themeColor="themeColor"
			@change="(payload) => emit('change', payload)"
			@pickerTap="(key) => emit('pickerTap', key)"
		>
			<template v-for="item in getSlotItems(group)" :key="item.key">
				<slot :name="`group-${index}-${item.key}`"></slot>
			</template>

			<slot :name="`group-${index}`" :model="modelValue" :group="group"></slot>
		</FormGroup>
	</view>
</template>

<script setup lang="ts">
	import FormGroup from "@/components/form-group/index.vue";
	import { onMounted } from "vue";

	type FormPageProps = {
		groups: FormGroupConfig[];
		modelValue?: Record<string, any>;
		themeColor?: string;
	};

	onMounted(() => {
		console.log("props:", props);
	});

	const props = withDefaults(defineProps<FormPageProps>(), {
		modelValue: () => ({}),
		themeColor: "#70a9a2",
	});

	const emit = defineEmits<{
		(e: "change", payload: { key: string; value: any }): void;
		(e: "pickerTap", key: string): void;
	}>();

	const getSlotItems = (group: FormGroupConfig): FormItemConfig[] => {
		return (group.items || []).filter((item) => item.type === "slot");
	};
</script>
