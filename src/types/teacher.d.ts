interface TeacherListResponse {
	teachers: TeacherResponse[];
	total: number;
}

interface TeacherResponse {
	teacherId: number;
	username: string;
	account: string;
	isAdmin: boolean;
	isAvailable: boolean;
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
	institutionId: number;
	teacherId: number;
	username: string;
	account?: string;
	isAvailable?: boolean;
	password?: string;
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
