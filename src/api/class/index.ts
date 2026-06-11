/** @description 班级 API 接口模块，提供班级信息的增删改查及学生管理接口 */
import { post } from "@/utils/request";

/**
 * 根据学生 ID 获取该学生所在的班级列表
 * @param studentId - 学生 ID
 * @returns 返回班级列表响应数据
 */
const getClassListByStudentId = async (
	QueryForm: GetClassListByStudentIdRequest,
): Promise<ClassListResponse> => {
	const res = await post<ClassListResponse>(
		"/biz/class/get_classes_by_student_id",
		QueryForm,
	);
	return res.data;
};

/**
 * 根据教师 ID 获取该教师关联的班级列表
 * @param QueryForm - 查询参数，包含 teacherId 及筛选条件
 * @returns 返回班级列表响应数据
 */
const getClassListByTeacherId = async (
	QueryForm: GetClassListByTeacherIdRequest,
): Promise<ClassListResponse> => {
	const res = await post<ClassListResponse>(
		"/biz/class/get_classes_by_teacher_id",
		QueryForm,
	);
	return res.data;
};

/**
 * 根据机构 ID 获取该机构下的班级列表
 * @param QueryForm - 查询参数，包含 institutionId 及筛选条件
 * @returns 返回班级列表响应数据
 */
const getClassListByInstitutionId = async (
	QueryForm: GetClassListByInstitutionIdRequest,
): Promise<ClassListResponse> => {
	const res = await post<ClassListResponse>(
		"/biz/class/get_classes_by_institution_id",
		QueryForm,
	);
	return res.data;
};

/**
 * 根据作用域获取班级列表，scope 为 1 按教师查询，scope 为 2 按机构查询
 * @param QueryForm - 通用查询参数，包含 scope、targetId 及筛选条件
 * @returns 返回班级列表响应数据
 */
const getClassList = async (
	QueryForm: GetClassListRequest,
): Promise<ClassListResponse> => {
	if (QueryForm.scope === 1) {
		return getClassListByTeacherId({
			classStatus: QueryForm.classStatus,
			teacherId: QueryForm.targetId,
			keyword: QueryForm.keyword,
		});
	} else if (QueryForm.scope === 2) {
		return getClassListByInstitutionId({
			classStatus: QueryForm.classStatus,
			institutionId: QueryForm.targetId,
			keyword: QueryForm.keyword,
		});
	} else {
		return {} as ClassListResponse;
	}
};

/**
 * 将学生添加到指定班级
 * @param form - 添加学生到班级的请求参数
 * @returns 返回操作结果，成功返回非零值
 */
const addStudentToClass = async (
	form: AddStudentToClassRequest,
): Promise<number> => {
	let result = 0;
	await post<AddStudentToClassResponse>(
		"/biz/class/add_student_to_class",
		form,
	).then((res) => {
		if (res.code === 200) {
			result = res.data.result;
			return result;
		}
	});
	return result;
};

/**
 * 将学生从指定班级中移除
 * @param form - 移除学生出班级的请求参数
 * @returns 返回操作结果，成功返回非零值
 */
const removeStudentFromClass = async (
	form: RemoveStudentFromClassRequest,
): Promise<number> => {
	let result = 0;
	await post<RemoveStudentFromClassResponse>(
		"/biz/class/remove_student_from_class",
		form,
	).then((res) => {
		if (res.code === 200) {
			result = res.data.result;
			return result;
		}
	});
	return result;
};

/**
 * 根据班级 ID 获取单个班级详情
 * @param classId - 班级 ID
 * @returns 返回班级详情响应数据
 */
const getClassByClassId = async (
	classId: number,
): Promise<ClassListResponse> => {
	const res = await post<ClassListResponse>("/biz/class/get_class_by_id", {
		classId,
	});
	return res.data;
};

/**
 * 新增班级
 * @param form - 新增班级请求参数
 * @returns 返回新增班级的 ID
 */
const insertClass = async (form: InsertClassRequest): Promise<number> => {
	let result = 0;
	await post<InsertClassResponse>("/biz/class/insert", form).then((res) => {
		if (res.code === 200) {
			result = res.data.classId;
			return result;
		}
	});
	return result;
};

/**
 * 根据班级 ID 更新班级信息
 * @param form - 更新班级请求参数
 * @returns 返回操作结果，成功返回非零值
 */
const updateClassById = async (form: UpdateClassRequest): Promise<number> => {
	let result = 0;
	await post<UpdateClassResponse>("/biz/class/update_by_id", form).then((res) => {
		if (res.code === 200) {
			result = res.data.result;
			return result;
		}
	});
	return result;
};

export {
	getClassListByStudentId,
	getClassListByTeacherId,
	addStudentToClass,
	removeStudentFromClass,
	getClassByClassId,
	insertClass,
	getClassListByInstitutionId,
	getClassList,
	updateClassById,
};
