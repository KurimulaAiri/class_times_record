import { post } from "@/utils/request";
import { useStudentStore } from "@/stores/student";

const getStudentByStudentId = async (studentId: number): Promise<Student> => {
	let student: Student = {} as Student;
	await post<StudentListResponse>("/student/get_by_student_id", {
		studentId,
	}).then((res) => {
		student = res.data.list[0];
	});
	return student;
};

const getStudentListByParentId = async (
	query: StudentListByParentIdQueryForm,
): Promise<Student[]> => {
	let studentList: Student[] = [];
	if (query.parentId === 0) {
		uni.showToast({
			title: "身份错误",
			icon: "error",
		});
		return studentList;
	}
	await post<StudentListResponse>("/student/get_by_parent_id", query).then(
		(res) => {
			studentList = res.data.list;
		},
	);
	return studentList;
};

const getStudentListByTeacherId = async (
	query: StudentListByTeacherIdQueryForm,
): Promise<Student[]> => {
	let studentList: Student[] = [];
	if (query.teacherId === 0) {
		uni.showToast({
			title: "身份错误",
			icon: "error",
		});
		return studentList;
	}
	await post<StudentListResponse>("/student/get_by_teacher_id", query).then(
		(res) => {
			studentList = res.data.list;
		},
	);
	return studentList;
};

const getStudentListByClassId = async (
	QueryForm: StudentListByClassIdQueryForm,
): Promise<Student[]> => {
	let studentList: Student[] = [];
	if (QueryForm.classId === 0) {
		uni.showToast({
			title: "身份错误",
			icon: "error",
		});
		return studentList;
	}
	await post<StudentListResponse>("/student/get_by_class_id", QueryForm).then(
		(res) => {
			studentList = res.data.list;
		},
	);
	return studentList;
};

const getStudentListByCourseId = async (
	query: StudentListByCourseIdQueryForm,
): Promise<Student[]> => {
	let studentList: Student[] = [];
	if (query.courseId === 0) {
		uni.showToast({
			title: "身份错误",
			icon: "error",
		});
		return studentList;
	}
	await post<StudentListResponse>("/student/get_by_course_id", query).then(
		(res) => {
			studentList = res.data.list;
		},
	);
	return studentList;
};

const getStudentListByInstitutionId = async (
	query: StudentListByInstitutionIdQueryForm,
): Promise<Student[]> => {
	let studentList: Student[] = [];
	if (query.institutionId === 0) {
		uni.showToast({
			title: "身份错误",
			icon: "error",
		});
		return studentList;
	}
	await post<StudentListResponse>("/student/get_by_institution_id", query).then(
		(res) => {
			studentList = res.data.list;
		},
	);
	return studentList;
};

const getStudent = async (query: StudentListQueryForm): Promise<Student[]> => {
	const { targetId, sex, hasClass, keyword, currentPage, pageSize } = query;

	if (query.scope === 1) {
		return await getStudentListByTeacherId({
			teacherId: targetId,
			sex,
			hasClass,
			keyword,
			currentPage,
			pageSize,
		});
	} else if (query.scope === 2) {
		return await getStudentListByInstitutionId({
			institutionId: targetId,
			sex,
			hasClass,
			keyword,
			currentPage,
			pageSize,
		});
	}
	return [];
};

const updateStudentInfo = (studentInfo: EditStudentInfoForm) => {
	return post<ApiResponse<any>>("/student/update", studentInfo);
};

const insertStudent = async (data: InsertStudentForm): Promise<number> => {
	let studentId = 0;
	await post<InsertStudentResponse>("/student/insert", data).then((res) => {
		console.log("插入学生响应:", res);
		studentId = res.data.studentId;
	});
	return studentId;
};

const updateStudent = async (data: UpdateStudentForm): Promise<number> => {
	let studentId = 0;
	await post<UpdateStudentResponse>("/student/update", data).then((res) => {
		console.log("更新学生响应:", res);
		studentId = res.data.studentId;
	});

	const newStudentInfo = await getStudentByStudentId(studentId);
	console.log("更新学生信息:", newStudentInfo);

	const studentStore = useStudentStore();
	studentStore.setStudentInfo(newStudentInfo);

	return studentId;
};

export {
	getStudentListByParentId,
	updateStudentInfo,
	getStudentListByTeacherId,
	getStudentListByClassId,
	getStudentListByCourseId,
	getStudentListByInstitutionId,
	insertStudent,
	getStudent,
	updateStudent,
};
