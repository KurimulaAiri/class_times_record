interface ClassListResponse {
	classList: ClassResponse[];
	total: number;
}

interface ClassResponse {
	id: number;
	className: string;
	studentCount: number;
	studentMaxCount: number;
	courseId: number;
	courseName: string;
	teachers: TeacherResponse[];
	courseRecord: CourseRecordResponse;
	scheduleList?: BackendScheduleItem[];
	courseType: number;
	status: number;
	createTimeStr: string;
	updateTimeStr: string;
}

interface GetClassListRequest {
	scope: number;
	classStatus: number;
	targetId: number;
	keyword: string | undefined;
}

interface GetClassListByTeacherIdRequest {
	classStatus: number;
	teacherId: number;
	keyword: string | undefined;
}

interface GetClassListByStudentIdRequest {
	studentId: number;
	currentPage: number;
	pageSize: number;
}



interface GetClassListByInstitutionIdRequest {
	classStatus: number;
	institutionId: number;
	keyword: string | undefined;
}

interface AddStudentToClassRequest {
	classId: number;
	students: StudentResponse[];
}
interface AddStudentToClassResponse {
	result: number;
}

interface RemoveStudentFromClassRequest {
	classId: number;
	students: StudentResponse[];
}
interface RemoveStudentFromClassResponse {
	result: number;
}

interface ClassDeductRequest {
	classId: number;
	courseId: number;
	deductCount: number;
}

interface StudentDeductRequest {
	studentId: number;
	deductCount: number;
}

type FastDeductRequest = {
	remark: string;
} & (
	| {
			mode: "student";
			studentId: number;
			classes: ClassDeductRequest[];
	  }
	| {
			mode: "course";
			courseId: number;
			students: StudentDeductRequest[];
	  }
);

interface InsertClassRequest {
	className: string;
	courseId: number;
	maxCount: number;
	schedules: ClassScheduleRequest[];
	teachers: TeacherRequest[];
}

interface InsertClassResponse {
	classId: number;
	className: string;
}

type UpdateClassRequest = {
	classId: number;
	onlyUpdateClassOwn: boolean;
} & (
	| {
			className?: string;
			courseId?: number;
			maxCount?: number;
			status?: number;
			onlyUpdateClassOwn: true;
			schedules?: ClassScheduleRequest[] | null;
			teachers?: TeacherRequest[] | null;
	  }
	| {
			className: string;
			courseId: number;
			maxCount: number;
			status: number;
			onlyUpdateClassOwn: false;
			schedules: ClassScheduleRequest[];
			teachers: TeacherRequest[];
	  }
);

interface UpdateClassResponse {
	result: number;
}
