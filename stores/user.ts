import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUserStore = defineStore('user',() => {
    // 1. 初始化为 null，或者用 Partial。但 null 是最清晰的，表示“未登录”
    const userInfo = ref<User | null>(null);

    // 2. 设置用户信息
    const setUserInfo = (user: User) => {
        userInfo.value = user;
        console.log("用户信息已更新，当前为:", userInfo.value);
    };

    // 3. 清除用户信息
    const clearUserInfo = () => {
        userInfo.value = null;
        console.log("用户信息已清除:", userInfo.value);
    };

    return {
        userInfo,
        setUserInfo,
        clearUserInfo
    }
})
