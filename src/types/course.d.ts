interface CourseListResponse {
	courses: CourseResponse[];
	total: number;
}

interface CourseResponse {
	id: number;
	courseName: string;
	courseType: number;
	isAvailable: boolean;
	institution: InstitutionResponse;
	currentStudentCourseRecord: CourseRecordResponse;
}

interface InsertCourseResponse {
	courseId: number;
}

interface InsertCourseRequest {
	courseName: string;
	courseType: number;
	isAvailable: boolean;
	institutionId: number;
}

interface GetCourseByInstitutionIdRequest {
	institutionId: number;
	keyword: string;
	currentPage: number;
	pageSize: number;
}

interface GetCourseListByStudentIdRequest {
	studentId: number;
	currentPage: number;
	pageSize: number;
}

interface UpdateCourseRequest {
	courseId: number;
	courseName: string;
	courseType: number;
	isAvailable: boolean;
}

interface UpdateCourseResponse {
	effect: number;
}
