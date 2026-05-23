import { post } from "@/utils/request";

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

const deductByStudentId = async (
	data: FastDeductRequest & { mode: "student" },
): Promise<any> => {
	await post<any>("/course_record/deduct_by_student_id", data).then((res) => {
		return res.data;
	});
};

const deductByCourseId = async (
	data: FastDeductRequest & { mode: "course" },
): Promise<any> => {
	await post<any>("/course_record/deduct_by_course_id", data).then((res) => {
		return res.data;
	});
};

export { getCourseRecordList, deductByStudentId, deductByCourseId };
