<template>
    <view 
        class="card" 
        hover-class="card-hover" 
        :hover-stay-time="150"
        @tap="onCardTap"
        @longpress="onCardLongPress"
    >
        <view class="avatar" :style="{ background: avatarBg, color: avatarColor }">
            <text>{{ teacher.username.slice(0, 1) }}</text>
        </view>
        <text class="name">{{ teacher.username }}</text>
    </view>
</template>

<script setup lang="ts">
    import { computed, ref } from "vue";

    const props = defineProps<{ teacher: TeacherResponse }>();

    // 定义事件：新增 longpress 长按事件
    const emit = defineEmits<{
        (e: "contact", teacher: TeacherResponse): void;
        (e: "longpress", teacher: TeacherResponse): void;
    }>();

    // 引入一个锁，防止长按松手时同时触发 tap 事件
    const isLongPress = ref(false);

    // 点击事件
    const onCardTap = () => {
        if (isLongPress.value) {
            isLongPress.value = false; // 重置锁，拦截本次点击
            return;
        }
        console.log("[debug] 点击了老师:", props.teacher.username);
        emit("contact", props.teacher);
    };

    // 长按事件
    const onCardLongPress = () => {
        isLongPress.value = true; // 激活长按锁
        console.log("[debug] 长按了老师:", props.teacher.username);
        
        // 可以在这里触发震动反馈，体验极佳
        uni.vibrateShort({});
        
        emit("longpress", props.teacher);
    };

    // ... 你的 COLORS 和 palette 逻辑保持不变
    const COLORS = [
        { bg: "#E6F1FB", color: "#0C447C" },
        { bg: "#E1F5EE", color: "#085041" },
        { bg: "#FAECE7", color: "#712B13" },
        { bg: "#EEEDFE", color: "#3C3489" },
        { bg: "#FAEEDA", color: "#633806" },
    ];
    const palette = computed(() => COLORS[props.teacher.teacherId % COLORS.length]);
    const avatarBg = computed(() => palette.value.bg);
    const avatarColor = computed(() => palette.value.color);
</script>

<style scoped lang="scss" src="./index.scss">

</style>