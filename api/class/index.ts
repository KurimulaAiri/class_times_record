import { post } from "@/utils/request";

const getClassListByStudentId = async (
	studentId: number,
): Promise<ClassListResponse> => {
	const res = await post<ClassListResponse>(
		"/class/get_classes_by_student_id",
		{ studentId },
	);
	return res.data;
};

const getClassListByTeacherId = async (
	QueryForm: ClassListByTeacherIdQueryForm,
): Promise<ClassListResponse> => {
	const res = await post<ClassListResponse>(
		"/class/get_classes_by_teacher_id",
		QueryForm,
	);
	return res.data;
};

const addStudentToClass = async (
	form: AddStudentToClassQueryForm,
): Promise<number> => {
	let result = 0;
	await post<AddStudentToClassResponse>(
		"/class/add_student_to_class",
		form,
	).then((res) => {
		if (res.code === 200) {
			result = res.data.result;
			return result;
		}
	});
	return result;
};

const getClassByClassId = async (
	classId: number,
): Promise<ClassListResponse> => {
	const res = await post<ClassListResponse>("/class/get_class_by_id", {
		classId,
	});
	return res.data;
};

export {
	getClassListByStudentId,
	getClassListByTeacherId,
	addStudentToClass,
	getClassByClassId,
};
