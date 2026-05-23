import { post } from "@/utils/request";

const getTeacherById = async (id: number): Promise<TeacherResponse> => {
	const res = await post<TeacherListResponse>(`/teacher/get_by_id`, {
		teacherId: id,
	});

	console.log("加载老师数据:", res.data);

	return res.data.teachers[0];
};

const getTeachersByInstitutionId = async (form: GetTeachersByInstitutionIdRequest): Promise<TeacherListResponse> => {
	const res = await post<TeacherListResponse>(`/teacher/get_teacher_by_institution_id`, {
		institutionId: form.institutionId,
		currentPage: form.currentPage,
		pageSize: form.pageSize,
	});
	return res.data;
};

export { getTeacherById, getTeachersByInstitutionId };
