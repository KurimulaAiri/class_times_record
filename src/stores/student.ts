/** @description 学生状态管理模块，管理当前选中的学生列表和学生详情信息 */
import { defineStore } from 'pinia'
import { ref } from 'vue'

/** 学生状态 Store，提供学生列表和详情的读写操作 */
export const useStudentStore = defineStore('student',() => {

    /** 学生列表数据 */
    const studentList = ref<StudentResponse[]>([]);

    /** 当前选中的学生详情信息 */
    const studentInfo = ref<StudentResponse | null>(null);

    /** 设置学生列表数据 */
    const setStudentList = (studentListInput: StudentResponse[]) => {
        studentList.value = studentListInput;
    }
    /** 清除学生列表数据 */
    const clearStudentList = () => {
        studentList.value = [];
    }

    /** 设置当前选中的学生详情信息 */
    const setStudentInfo = (student: StudentResponse) => {
        studentInfo.value = student;
        console.log("setStudentInfo:", student);
    }
    /** 清除当前选中的学生详情信息 */
    const clearStudentInfo = () => {
        studentInfo.value = null;
    }

    /** 清除所有学生相关状态 */
    const clearAll = () => {
        studentList.value = [];
        studentInfo.value = null;
    }

    return {
        studentList,
        studentInfo,
        setStudentInfo,
        clearStudentInfo,
        setStudentList,
        clearStudentList,
        clearAll,
    }
})
