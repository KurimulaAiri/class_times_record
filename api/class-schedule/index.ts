import { post } from "@/utils/request";

const getClassScheduleByClassId = async (query: QueryClassScheduleForm): Promise<BackendScheduleItem[]> => {
	let res: BackendScheduleItem[] = [];
	await post<ClassScheduleResponse>(
		`/class_schedule/get_by_class_id`,
		query,
	).then((resIn: ApiResponse<ClassScheduleResponse>) => {
		res = resIn.data.classSchedules || [];
	});
	return res;
};

export { getClassScheduleByClassId };
