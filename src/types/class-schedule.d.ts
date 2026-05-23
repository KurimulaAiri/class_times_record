interface ClassScheduleResponse {
	id: number;
	classId: number;
	className: string;
	classroom: string;
	dayOfWeek: number;
	startDateStr: string;
	endDateStr: string;
	startTimeStr: string;
	endTimeStr: string;
	teachers: TeacherResponse[];
	remark?: string;
	color?: string;
	createTimeStr: string;
	updateTimeStr: string;
}

type GetClassScheduleListRequest = {
	currentPage: number;
	pageSize: number;
} & (
	| {
			classId: number;
	  }
	| {
			institutionId: number;
	  }
);

interface ClassScheduleListResponse {
	classSchedules: ClassScheduleResponse[];
	total: number;
}
