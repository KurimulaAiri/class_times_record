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
            @update:modelValue="(val) => emit('update:modelValue', val)"
            :themeColor="themeColor"
            @change="(payload) => emit('change', payload)"
            @pickerTap="(key) => emit('pickerTap', key)"
            @titleExtraTap="emit('groupTitleTap', index)"
        >
            <template #title-extra>
                <slot :name="`group-title-extra-${index}`" :group="group"></slot>
            </template>

            <template #item-slot="{ modelValue: mv, item: slotItem }">
                <slot
                    :name="`group-${index}-${slotItem.key}`"
                    :modelValue="mv"
                    :item="slotItem"
                ></slot>
            </template>

            <slot :name="`group-${index}`" :model="modelValue" :group="group"></slot>
        </FormGroup>
    </view>
</template>

<script setup lang="ts">
	import FormGroup from "@/components/form-group/index.vue";

	type FormPageProps = {
		groups: FormGroupConfig[];
		modelValue?: Record<string, any>;
		themeColor?: string;
	};

	const props = withDefaults(defineProps<FormPageProps>(), {
		modelValue: () => ({}),
		themeColor: "#70a9a2",
	});

	const emit = defineEmits<{
		(e: "change", payload: { key: string; value: any }): void;
		(e: "pickerTap", key: string): void;
		(e: "update:modelValue", value: Record<string, any>): void;
		(e: "groupTitleTap", groupIndex: number): void;
	}>();
</script>

<style scoped lang="scss" src="./index.scss"></style>
