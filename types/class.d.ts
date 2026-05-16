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

interface ClassListByTeacherIdQueryForm {
	teacherId: number;
	keyword: string | null;
}

interface AddStudentToClassQueryForm {
	classId: number;
	students: Student[];
}
interface AddStudentToClassResponse {
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
