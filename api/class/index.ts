import { post } from "@/utils/request";

const getClassListByStudentId = async (studentId: number): Promise<ClassListResponse> => {
    const res = await post<ClassListResponse>("/class/get_classes_by_student_id", { studentId });
	return res.data;
};

const getClassListByTeacherId = async (
    QueryForm: ClassListByTeacherIdQueryForm,
): Promise<ClassListResponse> => {
    const res = await post<ClassListResponse>("/class/get_classes_by_teacher_id", QueryForm);
	return res.data;
};

export { getClassListByStudentId, getClassListByTeacherId };
