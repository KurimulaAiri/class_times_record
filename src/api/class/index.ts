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
	QueryForm: ClassListQueryByTeacherIdForm,
): Promise<ClassListResponse> => {
	const res = await post<ClassListResponse>(
		"/class/get_classes_by_teacher_id",
		QueryForm,
	);
	return res.data;
};

const getClassListByInstitutionId = async (
	QueryForm: ClassListQueryByInstitutionIdForm,
): Promise<ClassListResponse> => {
	const res = await post<ClassListResponse>(
		"/class/get_classes_by_institution_id",
		QueryForm,
	);
	return res.data;
};

const getClassList = async (
	QueryForm: ClassListQueryForm,
): Promise<ClassListResponse> => {
	if (QueryForm.scope === 1) {
		return getClassListByTeacherId({
			teacherId: QueryForm.targetId,
			keyword: QueryForm.keyword,
		});
	} else if (QueryForm.scope === 2) {
		return getClassListByInstitutionId({
			institutionId: QueryForm.targetId,
			keyword: QueryForm.keyword,
		});
	} else {
		return {} as ClassListResponse;
	}
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

const removeStudentFromClass = async (
	form: RemoveStudentFromClassQueryForm,
): Promise<number> => {
	let result = 0;
	await post<RemoveStudentFromClassResponse>(
		"/class/remove_student_from_class",
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

const insertClass = async (form: InsertClassQueryForm): Promise<number> => {
	let result = 0;
	await post<InsertClassResponse>("/class/insert", form).then((res) => {
		if (res.code === 200) {
			result = res.data.classId;
			return result;
		}
	});
	return result;
};

const updateClassById = async (form: UpdateClassForm): Promise<number> => {
	let result = 0;
	await post<UpdateClassResponse>("/class/update_by_id", form).then((res) => {
		if (res.code === 200) {
			result = res.data.result;
			return result;
		}
	});
	return result;
};

export {
	getClassListByStudentId,
	getClassListByTeacherId,
	addStudentToClass,
	removeStudentFromClass,
	getClassByClassId,
	insertClass,
	getClassListByInstitutionId,
	getClassList,
	updateClassById,
};
