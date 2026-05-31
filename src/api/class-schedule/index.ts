/** @description 课程表 API 接口模块，提供课程表信息的查询接口 */
import { post } from "@/utils/request";

/**
 * 根据班级 ID 获取课程表列表
 * @param query - 查询参数，包含班级 ID 及分页条件
 * @returns 返回课程表数组
 */
const getClassScheduleByClassId = async (
	query: GetClassScheduleListRequest,
): Promise<ClassScheduleResponse[]> => {
	let res: ClassScheduleResponse[] = [];
	await post<ClassScheduleListResponse>(
		`/class_schedule/get_by_class_id`,
		query,
	).then((resIn: ApiResponse<ClassScheduleListResponse>) => {
		res = resIn.data.classSchedules || [];
	});
	return res;
};

/**
 * 根据机构 ID 获取课程表列表
 * @param query - 查询参数，包含机构 ID 及分页条件
 * @returns 返回课程表数组
 */
const getClassScheduleByInstitutionId = async (
	query: GetClassScheduleListRequest,
): Promise<ClassScheduleResponse[]> => {
	let res: ClassScheduleResponse[] = [];
	await post<ClassScheduleListResponse>(
		`/class_schedule/get_by_institution_id`,
		query,
	).then((resIn: ApiResponse<ClassScheduleListResponse>) => {
		res = resIn.data.classSchedules || [];
	});
	return res;
};

const updateClassScheduleById = async (
	query: UpdateClassScheduleRequest,
): Promise<UpdateClassScheduleResponse> => {
	return (
		await post<UpdateClassScheduleResponse>(`/class_schedule/update_by_id`, query)
	).data;
};

export {
	getClassScheduleByClassId,
	getClassScheduleByInstitutionId,
	updateClassScheduleById,
};
