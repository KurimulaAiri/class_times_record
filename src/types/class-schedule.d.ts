interface ClassSchedule {
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

type QueryClassScheduleForm = {
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

interface ClassScheduleResponse {
	classSchedules: ClassSchedule[];
	total: number;
}
