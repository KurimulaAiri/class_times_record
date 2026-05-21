interface ClassListResponse {
	classList: Class[];
	total: number;
}

interface Class {
	id: number;
	className: string;
	studentCount: number;
	studentMaxCount: number;
	courseId: number;
	courseName: string;
	teachers: TeacherResponse[];
	courseRecord: CourseRecord;
	scheduleList?: BackendScheduleItem[]; // 后端平铺的排课单表数据
	courseType: number;
	createTimeStr: string;
	updateTimeStr: string;
}

interface ClassListQueryForm {
	scope: number;
	targetId: number;
	keyword: string | null;
}

interface ClassListQueryByTeacherIdForm {
	teacherId: number;
	keyword: string | null;
}

interface ClassListQueryByInstitutionIdForm {
	institutionId: number;
	keyword: string | null;
}

interface AddStudentToClassQueryForm {
	classId: number;
	students: Student[];
}
interface AddStudentToClassResponse {
	result: number;
}

interface RemoveStudentFromClassQueryForm {
	classId: number;
	students: Student[];
}
interface RemoveStudentFromClassResponse {
	result: number;
}

interface ClassDeductRequest {
	classId: number;
	courseId: number;
	deductCount: number;
}

interface FastDeductRequest {
	studentId: number;
	remark: string;
	classes: ClassDeductRequest[];
}

interface InsertClassQueryForm {
	className: string;
	courseId: number;
	maxCount: number;
	schedules: ClassSchedule[];
	teachers: TeacherResponse[];
}

interface InsertClassResponse {
	classId: number;
	className: string;
}

interface UpdateClassForm {
	classId: number;
	className: string;
	courseId: number;
	maxCount: number;
	schedules: ClassSchedule[];
	teachers: TeacherResponse[];
}

interface UpdateClassResponse {
	result: number;
}
