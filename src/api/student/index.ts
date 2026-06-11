/** @description 学生 API 接口模块，提供学生信息的增删改查接口 */
import { post } from "@/utils/request";
import { useStudentStore } from "@/stores/student";
import { showToast } from "@/utils/common";

/**
 * 根据学生 ID 获取单个学生信息
 * @param studentId - 学生 ID
 * @returns 返回学生信息对象
 */
const getStudentByStudentId = async (
	studentId: number,
): Promise<StudentResponse> => {
	let student: StudentResponse = {} as StudentResponse;
	await post<StudentListResponse>("/biz/student/get_by_student_id", {
		studentId,
	}).then((res) => {
		student = res.data.list[0];
	});
	return student;
};

/**
 * 根据家长 ID 获取其关联的学生列表
 * @param query - 查询参数，包含 parentId 及分页筛选条件
 * @returns 返回学生信息数组
 */
const getStudentListByParentId = async (
	query: GetStudentListByParentIdRequest,
): Promise<StudentResponse[]> => {
	let studentList: StudentResponse[] = [];
	if (query.parentId === 0) {
		showToast("身份错误", "error");
		return studentList;
	}
	await post<StudentListResponse>("/biz/student/get_by_parent_id", query).then(
		(res) => {
			studentList = res.data.list;
		},
	);
	return studentList;
};

/**
 * 根据教师 ID 获取其关联的学生列表
 * @param query - 查询参数，包含 teacherId 及分页筛选条件
 * @returns 返回学生信息数组
 */
const getStudentListByTeacherId = async (
	query: GetStudentListByTeacherIdRequest,
): Promise<StudentResponse[]> => {
	let studentList: StudentResponse[] = [];
	if (query.teacherId === 0) {
		showToast("身份错误", "error");
		return studentList;
	}
	await post<StudentListResponse>("/biz/student/get_by_teacher_id", query).then(
		(res) => {
			studentList = res.data.list;
		},
	);
	return studentList;
};

/**
 * 根据班级 ID 获取该班级的学生列表
 * @param QueryForm - 查询参数，包含 classId 及分页筛选条件
 * @returns 返回学生信息数组
 */
const getStudentListByClassId = async (
	QueryForm: GetStudentListByClassIdRequest,
): Promise<StudentResponse[]> => {
	let studentList: StudentResponse[] = [];
	if (QueryForm.classId === 0) {
		showToast("身份错误", "error");
		return studentList;
	}
	await post<StudentListResponse>("/biz/student/get_by_class_id", QueryForm).then(
		(res) => {
			studentList = res.data.list;
		},
	);
	return studentList;
};

/**
 * 根据课程 ID 获取选修该课程的学生列表
 * @param query - 查询参数，包含 courseId 及分页筛选条件
 * @returns 返回学生信息数组
 */
const getStudentListByCourseId = async (
	query: GetStudentListByCourseIdRequest,
): Promise<StudentResponse[]> => {
	let studentList: StudentResponse[] = [];
	if (query.courseId === 0) {
		showToast("身份错误", "error");
		return studentList;
	}
	await post<StudentListResponse>("/biz/student/get_by_course_id", query).then(
		(res) => {
			studentList = res.data.list;
		},
	);
	return studentList;
};

/**
 * 根据机构 ID 获取该机构下的学生列表
 * @param query - 查询参数，包含 institutionId 及分页筛选条件
 * @returns 返回学生信息数组
 */
const getStudentListByInstitutionId = async (
	query: GetStudentListByInstitutionIdRequest,
): Promise<StudentResponse[]> => {
	let studentList: StudentResponse[] = [];
	if (query.institutionId === 0) {
		showToast("身份错误", "error");
		return studentList;
	}
	await post<StudentListResponse>("/biz/student/get_by_institution_id", query).then(
		(res) => {
			studentList = res.data.list;
		},
	);
	return studentList;
};

/**
 * 根据作用域获取学生列表，scope 为 1 按教师查询，scope 为 2 按机构查询
 * @param query - 通用查询参数，包含 scope、targetId 及筛选条件
 * @returns 返回学生信息数组
 */
const getStudent = async (
	query: GetStudentListRequest,
): Promise<StudentResponse[]> => {
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

/**
 * 更新学生信息（旧版接口）
 * @param studentInfo - 学生信息更新请求参数
 * @returns 返回后端响应数据
 */
const updateStudentInfo = (studentInfo: UpdateStudentInfoRequest) => {
	return post<ApiResponse<any>>("/biz/student/update", studentInfo);
};

/**
 * 新增学生
 * @param data - 新增学生请求参数
 * @returns 返回新增学生的 ID
 */
const insertStudent = async (data: InsertStudentRequest): Promise<number> => {
	let studentId = 0;
	await post<InsertStudentResponse>("/biz/student/insert", data).then((res) => {
		console.log("插入学生响应:", res);
		studentId = res.data.studentId;
	});
	return studentId;
};

/**
 * 更新学生信息，更新后同步刷新学生 Store 中的缓存数据
 * @param data - 更新学生请求参数
 * @returns 返回更新学生的 ID
 */
const updateStudent = async (data: UpdateStudentRequest): Promise<number> => {
	let studentId = 0;
	await post<UpdateStudentResponse>("/biz/student/update", data).then((res) => {
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
