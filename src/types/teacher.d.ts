interface TeachersResponse {
	teachers: TeacherResponse[];
	total: number;
}

interface TeacherResponse {
	teacherId: number;
	username: string;
	institution: Institution;
}

interface GetTeachersByInstitutionIdForm {
	institutionId: number;
	currentPage: number;
	pageSize: number;
}
