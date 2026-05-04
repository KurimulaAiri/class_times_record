import { post } from "@/utils/request";
import {
	Student,
	EditStudentInfoForm,
	StudentListResponse,
	StudentListQueryForm,   
} from "@/types/student";

const getStudentListByParentId = async (QueryForm: StudentListQueryForm) : Promise<Student[]> => {
	let studentList: Student[] = [];
    if (QueryForm.parentId === 0) {
        uni.showToast({
            title: "身份错误",
            icon: "error",
        });
        return studentList;
    }
	await post<StudentListResponse>("/student/get_by_parent_id", QueryForm).then(
		(res) => {
			studentList = res.data.list;
		},
	);
	return studentList;
};

const updateStudentInfo = (studentInfo: EditStudentInfoForm) => {
	return post<ApiResponse<any>>("/student/update", studentInfo);
};

export { getStudentListByParentId, updateStudentInfo };
