/** @description 课程 API 接口模块，提供课程信息的查询和创建接口 */
import { post } from "@/utils/request";

/**
 * 根据机构 ID 获取该机构下的课程列表
 * @param query - 查询参数，包含 institutionId 及分页筛选条件
 * @returns 返回课程列表响应数据
 */
const getCourseByInstitutionId = async (query: GetCourseByInstitutionIdRequest) => {
	const res = await post<CourseListResponse>(`/course/get_course_by_institution_id`, query);
	return res.data;
};

/**
 * 新增课程
 * @param query - 新增课程请求参数
 * @returns 返回新增课程响应数据
 */
const insertCourse = async (query: InsertCourseRequest) => {
	const res = await post<InsertCourseResponse>(`/course/add_course`, query);
	return res.data;
};


export { getCourseByInstitutionId, insertCourse };
