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

export { CourseRecord, GetCourseRecordResponse };
