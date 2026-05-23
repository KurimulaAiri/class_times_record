import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUserStore = defineStore('user',() => {
    const userInfo = ref<UserResponse | null>(null);

    const setUserInfo = (user: UserResponse) => {
        userInfo.value = user;
        console.log("用户信息已更新，当前为:", userInfo.value);
    };

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
