import { post } from "@/utils/request";

const getCourseRecordList = async (
	data: GetCourseRecordForm,
): Promise<CourseRecordList> => {
	let courseList: CourseRecordList = [];
	await post<GetCourseRecordResponse>("/course_record/new_get", data).then(
		(res) => {
			courseList = res.data.courseRecords;
		},
	);
	return courseList;
};

const deductByStudentId = async (data: FastDeductRequest): Promise<any> => {
	await post<any>("/course_record/deduct_by_student_id", data).then((res) => {
		return res.data;
	});
};

export { getCourseRecordList, deductByStudentId };
