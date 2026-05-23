import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useStudentStore = defineStore('student',() => {

    const studentList = ref<StudentResponse[]>([]);

    const studentInfo = ref<StudentResponse | null>(null);

    const setStudentList = (studentListInput: StudentResponse[]) => {
        studentList.value = studentListInput;
    }
    const clearStudentList = () => {
        studentList.value = [];
    }

    const setStudentInfo = (student: StudentResponse) => {
        studentInfo.value = student;
        console.log("setStudentInfo:", student);
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
