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

interface ClassScheduleRequest {
	classId: number;
	dayOfWeek: number;
	startDate: string;
	endDate: string;
	startTime: string;
	endTime: string;
	teachers?: TeacherRequest[];
	remark?: string;
	color?: string;
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

interface UpdateClassScheduleRequest {
	id: number;
	dayOfWeek: number;
	startDate: string;
	endDate: string;
	startTime: string;
	endTime: string;
	remark?: string;
}

interface UpdateClassScheduleResponse {
	classSchedules: ClassScheduleResponse[];
}

interface GetClassScheduleByIdRequest {
	id: number;
}
