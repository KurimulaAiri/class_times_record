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
