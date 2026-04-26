interface Student {
    id: number;
    studentName: string;
    birthStr: string;
    school: string;
    address: string;
    createTimeStr: string;
    updateTimeStr: string;
}

interface StudentListQueryForm {
    parentId: number;
    currentPage: number;
    pageSize: number;
}

interface StudentListResponse {
    list: Student[];
    total: number;
}

export { Student, StudentListQueryForm, StudentListResponse };