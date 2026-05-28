/** @description 课卡记录 API 接口模块，提供课卡记录的查询和扣课接口 */
import { post } from "@/utils/request";

/**
 * 获取课卡记录列表
 * @param data - 查询参数，包含筛选及分页条件
 * @returns 返回课卡记录数组
 */
const getCourseRecordList = async (
	data: GetCourseRecordListRequest,
): Promise<CourseRecordResponse[]> => {
	let courseList: CourseRecordResponse[] = [];
	await post<CourseRecordListResponse>("/course_record/new_get", data).then(
		(res) => {
			courseList = res.data.courseRecords;
		},
	);
	return courseList;
};

const insertCourseRecord = async (
	form: InsertCourseRecordRequest,
): Promise<CourseRecordResponse> => {
	let result = {} as CourseRecordResponse;
	await post<CourseRecordResponse>("/course_record/insert", form).then(
		(res) => {
			if (res.code === 200) {
				result = res.data;
				return result;
			}
		},
	);
	return result;
};

/**
 * 按学生 ID 进行扣课操作
 * @param data - 扣课请求参数，包含学生 ID 及扣课模式为 student
 * @returns 返回扣课操作结果
 */
const deductByStudentId = async (
	data: FastDeductRequest & { mode: "student" },
): Promise<any> => {
	await post<any>("/course_record/deduct_by_student_id", data).then((res) => {
		return res.data;
	});
};

/**
 * 按课程 ID 进行扣课操作
 * @param data - 扣课请求参数，包含课程 ID 及扣课模式为 course
 * @returns 返回扣课操作结果
 */
const deductByCourseId = async (
	data: FastDeductRequest & { mode: "course" },
): Promise<any> => {
	await post<any>("/course_record/deduct_by_course_id", data).then((res) => {
		return res.data;
	});
};

export {
	getCourseRecordList,
	deductByStudentId,
	deductByCourseId,
	insertCourseRecord,
};
