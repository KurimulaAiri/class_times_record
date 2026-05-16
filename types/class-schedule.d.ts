interface BackendScheduleItem {
	id?: number;
	startDateStr: string;
	endDateStr: string;
	dayOfWeek: number;
	startTimeStr: string;
	endTimeStr: string;
	classroom?: string;
	remark?: string;
	createTimeStr: string;
	updateTimeStr: string;
}

interface QueryClassScheduleForm {
	classId: number;
	currentPage: number;
	pageSize: number;
}

interface ClassScheduleResponse {
	classSchedules: BackendScheduleItem[];
	total: number;
}
