interface StudentResponse {
	id: number;
	avatar: string;
	studentName: string;
	sex: number;
	relation: string;
	birthStr: string;
	school: string;
	address: string;
	institutions: InstitutionResponse[];
	primaryParent: ParentResponse;
	secondaryParent: ParentResponse;
	courseTotalTime: number;
	courseRestTime: number;
	createTimeStr: string;
	updateTimeStr: string;
}

interface GetStudentListByParentIdRequest {
	parentId: number;
	currentPage: number;
	pageSize: number;
}

interface GetStudentListByTeacherIdRequest {
	teacherId: number;
	sex: number | null;
	hasClass: number | null;
	keyword: string | null;
	currentPage: number;
	pageSize: number;
}

interface GetStudentListByInstitutionIdRequest {
	institutionId: number;
	sex: number | null;
	hasClass: number | null;
	keyword: string | null;
	currentPage: number;
	pageSize: number;
}

interface GetStudentListRequest {
	scope: number;
	targetId: number;
	sex: number | null;
	hasClass: number | null;
	keyword: string | null;
	currentPage: number;
	pageSize: number;
}

type UpdateStudentInfoRequest = import("@/utils/common").FormModel<
	StudentResponse,
	"id" | "avatar" | "birthStr" | "school" | "address"
>;

type SubmitUpdateStudentInfoRequest = Omit<
	UpdateStudentInfoRequest,
	"birthStr"
> & {
	birth: string;
};

interface StudentListResponse {
	list: StudentResponse[];
	total: number;
}

interface GetStudentListByCourseIdRequest {
	courseId: number;
	currentPage: number;
	pageSize: number;
}

interface GetStudentListByClassIdRequest {
	classId: number;
	currentPage: number;
	pageSize: number;
}

interface InsertStudentRequest {
	studentName: string;
	institutionId: number;
	sex: number;
	birth: string;
	school: string;
	address: string;
	primaryParent: ParentResponse;
	secondaryParent: ParentResponse;
}

interface InsertStudentResponse {
	studentId: number;
}

interface UpdateStudentRequest {
	id: number;
	avatar: string;
	studentName: string;
	sex: number;
	birthStr: string;
	school: string;
	address: string;
	primaryParent: ParentResponse | null;
	secondaryParent: ParentResponse | null;
}

interface UpdateStudentResponse {
	studentId: number;
}
