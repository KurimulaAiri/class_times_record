interface TeacherListResponse {
	teachers: TeacherResponse[];
	total: number;
}

interface TeacherResponse {
	teacherId: number;
	username: string;
	institution: InstitutionResponse;
}

interface TeacherRequest {
	teacherId: number;
}

interface GetTeachersByInstitutionIdRequest {
	institutionId: number;
	currentPage: number;
	pageSize: number;
}
