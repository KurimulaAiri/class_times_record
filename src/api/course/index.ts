/** @description 课程 API 接口模块，提供课程信息的查询和创建接口 */
import { post } from "@/utils/request";

/**
 * 根据机构 ID 获取该机构下的课程列表
 * @param query - 查询参数，包含 institutionId 及分页筛选条件
 * @returns 返回课程列表响应数据
 */
const getCourseByInstitutionId = async (query: GetCourseByInstitutionIdRequest) => {
	const res = await post<CourseListResponse>(`/biz/course/get_course_by_institution_id`, query);
	return res.data;
};

/**
 * 根据学生 ID 获取该学生所在的课程列表
 * @param studentId - 学生 ID
 * @returns 返回课程列表响应数据
 */
const getCourseListByStudentId = async (query: GetCourseListByStudentIdRequest) => {
	const res = await post<CourseListResponse>(`/biz/course/get_course_by_student_id`, query);
	return res.data;
};

/**
 * 新增课程
 * @param query - 新增课程请求参数
 * @returns 返回新增课程响应数据
 */
const insertCourse = async (query: InsertCourseRequest) => {
	const res = await post<InsertCourseResponse>(`/biz/course/add_course`, query);
	return res.data;
};

/**
 * 更新课程信息
 * @param form - 更新课程请求参数
 * @returns 返回影响的行数
 */
const updateCourse = async (form: UpdateCourseRequest): Promise<number> => {
	const res = await post<UpdateCourseResponse>(`/biz/course/update_by_id`, form);
	return res.data.effect;
};

export { getCourseByInstitutionId, insertCourse, getCourseListByStudentId, updateCourse };
