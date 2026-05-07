interface ClassListResponse {
    classList: Class[];
    total: number;
}

interface Class {
    id:number
    className: string;
    studentCount: number;
    courseName: string;
    username: string;
    courseType: number;
    createTimeStr: string;
    updateTimeStr: string;
}

interface ClassListByTeacherIdQueryForm {
    teacherId: number;
    keyword: string | null;
}