import { post } from "@/utils/request";


const getCourseRecordList = async (
	data: GetCourseRecordForm,
): Promise<CourseRecordList> => {
    let courseList: CourseRecordList = [];
    await post<GetCourseRecordResponse>(
		"/course_record/new_get",
		data,
	).then((res) => {
		courseList = res.data.courseRecords;
	});
	return courseList;
};

export { getCourseRecordList };
