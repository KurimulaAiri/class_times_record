import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUserStore = defineStore('user',() => {
    // 1. 定义对象状态，初始化为空或默认值
    const userInfo = ref<User>({
        userId: 0,
        identityInfo: {
            userId: 0,
            isAvailable: false,
            username: ''
        },
        createTimeStr: '',
        updateTimeStr: ''
    });

    const setUserInfo = (user: User) => {
        userInfo.value = user
        console.log("用户信息已更新:", userInfo.value);
    }

    const clearUserInfo = () => {
        userInfo.value = {
            userId: 0,
            identityInfo: {
                userId: 0,
                isAvailable: false,
                username: ''
            },
            createTimeStr: '',
            updateTimeStr: ''
        }
        console.log("用户信息已清除:", userInfo.value);
    }

    return {
        userInfo,
        setUserInfo,
        clearUserInfo
    }
})
