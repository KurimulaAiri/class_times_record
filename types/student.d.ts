import { FormModel } from "@/utils/common";

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
	keyword: string | null;
	currentPage: number;
	pageSize: number;
}

type EditStudentInfoForm = FormModel<
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
