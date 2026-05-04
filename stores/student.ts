import { defineStore } from 'pinia'
import { ref } from 'vue'
import { Student } from '@/types/student.d'

export const useStudentStore = defineStore('student',() => {

    const studentList = ref<Student[]>([]);

    const studentInfo = ref<Student | null>(null);

    const setStudentList = (studentListInput: Student[]) => {
        studentList.value = studentListInput;
    }
    const clearStudentList = () => {
        studentList.value = [];
    }

    const setStudentInfo = (student: Student) => {
        studentInfo.value = student;
    }
    const clearStudentInfo = () => {
        studentInfo.value = null;
    }

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