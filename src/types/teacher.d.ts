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

interface UpdateTeacherByIdRequest {
	teacherId: number;
	username: string;
}

interface UpdateTeacherByIdResponse {
	effect: number;
}

interface InsertTeacherRequest {
	username: string;
	account: string;
	password: string;
	institutionId: number;
}

interface InsertTeacherResponse {
	teacher: TeacherResponse;
}
