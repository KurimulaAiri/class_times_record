import { post } from "@/utils/request";

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

export { getClassScheduleByClassId, getClassScheduleByInstitutionId };
