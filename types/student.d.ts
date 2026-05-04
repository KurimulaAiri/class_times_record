import { FormModel } from "@/utils/common";

interface Student {
    id: number;
    avatar: string;
    studentName: string;
    relation: string;
    birthStr: string;
    school: string;
    address: string;
    institutions: Institution[];
    createTimeStr: string;
    updateTimeStr: string;
}

interface StudentListQueryForm {
    parentId: number;
    currentPage: number;
    pageSize: number;
}

type EditStudentInfoForm = FormModel<Student,"id" | "avatar" | "birthStr" | "school" | "address">;

type SubmitEditStudentInfoForm = Omit<EditStudentInfoForm, "birthStr"> & {
    birth: string;
};

interface StudentListResponse {
    list: Student[];
    total: number;
}

export { Student, StudentListQueryForm, StudentListResponse, EditStudentInfoForm, SubmitEditStudentInfoForm };