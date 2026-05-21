// student.d.ts
interface Student {
	id: number;
	avatar: string;
	studentName: string;
	sex: number;
	relation: string;
	birthStr: string;
	school: string;
	address: string;
	institutions: Institution[];
	primaryParent: Parent;
	secondaryParent: Parent;
	courseTotalTime: number;
	courseRestTime: number;
	createTimeStr: string;
	updateTimeStr: string;
}

interface StudentListByParentIdQueryForm {
	parentId: number;
	currentPage: number;
	pageSize: number;
}

interface StudentListByTeacherIdQueryForm {
	teacherId: number;
	sex: number | null;
	hasClass: boolean | null;
	keyword: string | null;
	currentPage: number;
	pageSize: number;
}

interface StudentListByInstitutionIdQueryForm {
	institutionId: number;
	sex: number | null;
	hasClass: boolean | null;
	keyword: string | null;
	currentPage: number;
	pageSize: number;
}

interface StudentListQueryForm {
	scope: number; // 1 为查教师，2 为查机构
	targetId: number;
	sex: number | null;
	hasClass: boolean | null;
	keyword: string | null;
	currentPage: number;
	pageSize: number;
}

type EditStudentInfoForm = import("@/utils/common").FormModel<
	Student,
	"id" | "avatar" | "birthStr" | "school" | "address"
>;

type SubmitEditStudentInfoForm = Omit<EditStudentInfoForm, "birthStr"> & {
	birth: string;
};

interface StudentListResponse {
	list: Student[];
	total: number;
}

interface StudentListByClassIdQueryForm {
	classId: number;
	currentPage: number;
	pageSize: number;
}

interface InsertStudentForm {
	studentName: string;
	institutionId: number;
	sex: number;
	birth: string;
	school: string;
	address: string;
	primaryParent: Parent;
	secondaryParent: Parent;
}

interface InsertStudentResponse {
	studentId: number;
}

interface UpdateStudentForm {
	id: number;
	avatar: string;
	studentName: string;
	sex: number;
	birthStr: string;
	school: string;
	address: string;
	primaryParent: Parent | null;
	secondaryParent: Parent | null;
}

interface UpdateStudentResponse {
	studentId: number;
}
