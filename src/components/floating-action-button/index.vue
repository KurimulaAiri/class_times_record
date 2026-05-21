<template>
    <view 
        class="fab-btn" 
        hover-class="fab-btn-active"
        :class="[hoverClass]"
        :style="fabStyle"
        @tap.stop="handleClick"
    >
        <slot>
            <!-- 默认展示加号，支持传入 uni-icons 或文本 -->
            <text class="plus-icon" :style="{ fontSize: iconSize + 'rpx' }">{{ iconText }}</text>
        </slot>
    </view>
</template>

<script setup lang="ts">
import { computed } from 'vue';

// 定义 Props 增强通用性
interface Props {
    bgColor?: string;       // 按钮背景色，支持渐变
    iconText?: string;      // 默认文本图标，如 '+'、'?'
    iconSize?: number;      // 图标字体大小，单位 rpx
    right?: number;         // 距离右侧距离，单位 rpx
    bottom?: number;        // 距离底部距离，单位 rpx
    zIndex?: number;        // 层级
    hoverClass?: string;    // 点击态类名
}

const props = withDefaults(defineProps<Props>(), {
    bgColor: '#70a9a2', // 默认使用你的 $theme-color，也可以在外部传入
    iconText: '+',
    iconSize: 60,
    right: 40,
    bottom: 60,
    zIndex: 99,
    hoverClass: 'fab-btn-active'
});

// 定义通知父组件的事件
const emit = defineEmits<{
    (e: 'click'): void;
    (e: 'tap'): void; // 兼顾 uni 习惯
}>();

// 动态计算样式
const fabStyle = computed(() => {
    // 判断是否是渐变色，如果不是则转为 linear-gradient 保持视觉高级感
    const background = props.bgColor.includes('gradient') 
        ? props.bgColor 
        : `linear-gradient(135deg, ${props.bgColor}, ${props.bgColor})`;

    return {
        background,
        right: `${props.right}rpx`,
        // 关键：自动加上系统窗口底部的安全距离（如小程序 tabbar 或全面屏黑条）
        bottom: `calc(${props.bottom}rpx + var(--window-bottom))`,
        zIndex: props.zIndex,
        // 根据背景色动态生成相配的阴影
        boxShadow: props.bgColor.startsWith('#') 
            ? `0 10rpx 30rpx ${props.bgColor}66` 
            : '0 10rpx 30rpx rgba(0, 0, 0, 0.15)'
    };
});

const handleClick = () => {
    emit('click');
    emit('tap');
};
</script>

<style lang="scss" scoped src="./index.scss">
</style>