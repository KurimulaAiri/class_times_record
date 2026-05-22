import { post } from "@/utils/request";

const getClassScheduleByClassId = async (
	query: QueryClassScheduleForm,
): Promise<ClassSchedule[]> => {
	let res: ClassSchedule[] = [];
	await post<ClassScheduleResponse>(
		`/class_schedule/get_by_class_id`,
		query,
	).then((resIn: ApiResponse<ClassScheduleResponse>) => {
		res = resIn.data.classSchedules || [];
	});
	return res;
};

const getClassScheduleByInstitutionId = async (
	query: QueryClassScheduleForm,
): Promise<ClassSchedule[]> => {
	let res: ClassSchedule[] = [];
	await post<ClassScheduleResponse>(
		`/class_schedule/get_by_institution_id`,
		query,
	).then((resIn: ApiResponse<ClassScheduleResponse>) => {
		res = resIn.data.classSchedules || [];
	});
	return res;
};

export { getClassScheduleByClassId, getClassScheduleByInstitutionId };
