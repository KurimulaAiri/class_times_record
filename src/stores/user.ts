/** @description 用户状态管理模块，管理用户登录信息、身份信息等全局状态 */
import { defineStore } from 'pinia'
import { ref } from 'vue'

/** 用户状态 Store，提供用户信息的读写和清除操作 */
export const useUserStore = defineStore('user',() => {
    /** 当前登录用户信息 */
    const userInfo = ref<UserResponse | null>(null);

    /** 设置用户信息 */
    const setUserInfo = (user: UserResponse) => {
        userInfo.value = user;
        console.log("用户信息已更新，当前为:", userInfo.value);
    };

    /** 清除用户信息（退出登录时调用） */
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
