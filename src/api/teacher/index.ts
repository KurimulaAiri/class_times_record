/** @description 教师 API 接口模块，提供教师信息的查询接口 */
import { post } from "@/utils/request";

/**
 * 根据教师 ID 获取单个教师信息
 * @param id - 教师 ID
 * @returns 返回教师信息对象
 */
const getTeacherById = async (id: number): Promise<TeacherResponse> => {
	const res = await post<TeacherListResponse>(`/teacher/get_by_id`, {
		teacherId: id,
	});

	console.log("加载老师数据:", res.data);

	return res.data.teachers[0];
};

/**
 * 根据机构 ID 获取该机构下的教师列表
 * @param form - 查询参数，包含 institutionId 及分页条件
 * @returns 返回教师列表响应数据
 */
const getTeachersByInstitutionId = async (form: GetTeachersByInstitutionIdRequest): Promise<TeacherListResponse> => {
	const res = await post<TeacherListResponse>(`/teacher/get_teacher_by_institution_id`, {
		institutionId: form.institutionId,
		currentPage: form.currentPage,
		pageSize: form.pageSize,
	});
	return res.data;
};

export { getTeacherById, getTeachersByInstitutionId };
