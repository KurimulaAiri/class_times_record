interface CourseRecordResponse {
	courseLastTimeStr: string;
	courseName: string;
	courseOwnerUserId: number;
	courseRemark: string;
	courseRestTime: number;
	courseStatus: number;
	courseTotalTime: number;
	createTimeStr: string;
	id: number;
	isDelete: boolean;
	permissionType: number;
	stuName: string;
	updateTimeStr: string;
}

interface InsertCourseRecordRequest {
	courseId: number;
	studentId: number;
	courseRemark: string;
	courseRestTime: number;
	courseTotalTime: number;
}

type CourseRecordListResponse = {
	courseRecords: CourseRecordResponse[];
	total: number;
};

type GetCourseRecordListRequest = {
	studentId: number;
	stuName: string;
	courseName: string;
	courseRemark: string;
	courseStatus: number | null;
	currentPage: number;
	pageSize: number;
};
