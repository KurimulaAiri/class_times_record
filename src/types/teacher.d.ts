interface TeacherListResponse {
	teachers: TeacherResponse[];
	total: number;
}

interface TeacherResponse {
	teacherId: number;
	username: string;
	institution: InstitutionResponse;
}

interface GetTeachersByInstitutionIdRequest {
	institutionId: number;
	currentPage: number;
	pageSize: number;
}
