interface RecordResponse {
	courseRecordId: number;
	createTimeStr: string;
	id: number;
	recordChange: number;
	recordRemark: string;
	recordTimeStr: string;
	recordType: number;
	updateTimeStr: string;
	courseRecord: CourseRecordResponse;
	student: StudentResponse;
	course: CourseResponse;
	operatorTeacher: TeacherResponse;
}

type RecordListResponse = {
	records: RecordResponse[];
	total: number;
};

interface GetRecordListRequest {
	institutionId: number;
	currentPage: number;
	pageSize: number;
}
