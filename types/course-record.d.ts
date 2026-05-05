interface CourseRecord {
	courseLastTimeStr: string;
	courseName: string;
	courseOwnerUserId: number;
	courseRemark: string;
	courseRestTime: number;
	courseStatus: number;
	courseTotalTime: number;
	createTimeStr: string;
	id: number;
	isDelete: string;
	permissionType: number;
	stuName: string;
	updateTimeStr: string;
}

type GetCourseRecordResponse = {
	courseRecords: CourseRecord[];
    total: number;
}

type CourseRecordList = CourseRecord[];

type GetCourseRecordForm = {
	studentId: number;
	stuName: string;
	courseName: string;
	courseRemark: string;
	courseStatus: number | null;
	currentPage: number;
	pageSize: number;
};