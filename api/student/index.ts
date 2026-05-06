import { post } from "@/utils/request";
import {
	Student,
	EditStudentInfoForm,
	StudentListResponse,
	StudentListByParentIdQueryForm,
	StudentListByTeacherIdQueryForm,
} from "@/types/student";

const getStudentListByParentId = async (
	QueryForm: StudentListByParentIdQueryForm,
): Promise<Student[]> => {
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

const getStudentListByTeacherId = async (
	QueryForm: StudentListByTeacherIdQueryForm,
): Promise<Student[]> => {
	let studentList: Student[] = [];
	if (QueryForm.teacherId === 0) {
		uni.showToast({
			title: "身份错误",
			icon: "error",
		});
		return studentList;
	}
	await post<StudentListResponse>("/student/get_by_teacher_id", QueryForm).then(
		(res) => {
			studentList = res.data.list;
		},
	);
	return studentList;
};

const updateStudentInfo = (studentInfo: EditStudentInfoForm) => {
	return post<ApiResponse<any>>("/student/update", studentInfo);
};

export {
	getStudentListByParentId,
	updateStudentInfo,
	getStudentListByTeacherId,
};
