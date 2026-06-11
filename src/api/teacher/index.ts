/** @description 教师 API 接口模块，提供教师信息的查询接口 */
import { post } from "@/utils/request";

/**
 * 根据教师 ID 获取单个教师信息
 * @param id - 教师 ID
 * @returns 返回教师信息对象
 */
const getTeacherById = async (id: number): Promise<TeacherResponse> => {
	const res = await post<TeacherListResponse>(`/biz/teacher/get_by_id`, {
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
const getTeachersByInstitutionId = async (
	form: GetTeachersByInstitutionIdRequest,
): Promise<TeacherListResponse> => {
	const res = await post<TeacherListResponse>(
		`/biz/teacher/get_teacher_by_institution_id`,
		{
			institutionId: form.institutionId,
			currentPage: form.currentPage,
			pageSize: form.pageSize,
		},
	);
	return res.data;
};

const updateTeacherById = async (
	form: UpdateTeacherByIdRequest,
): Promise<number> => {
	const res = await post<UpdateTeacherByIdResponse>(
		`/biz/teacher/update_by_id`,
		form,
	);
	return res.data.effect;
};

/**
 * 添加教师
 * @param form - 添加教师请求参数，包含用户名和机构 ID
 * @returns 返回新创建的教师 ID
 */
const insertTeacher = async (form: InsertTeacherRequest): Promise<TeacherResponse> => {
	const res = await post<InsertTeacherResponse>(`/biz/teacher/insert`, form);
	return res.data.teacher;
};

export { getTeacherById, getTeachersByInstitutionId, updateTeacherById, insertTeacher };
