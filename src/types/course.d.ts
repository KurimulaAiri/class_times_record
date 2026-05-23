interface CourseListResponse {
	courses: CourseResponse[];
    total: number;
}

interface CourseResponse {
	id: number;
	courseName: string;
    courseType: number;
    available: boolean;
    institution: InstitutionResponse;
}

interface GetCourseByInstitutionIdRequest {
	institutionId: number;
    keyword: string;
    currentPage: number;
    pageSize: number;
}
