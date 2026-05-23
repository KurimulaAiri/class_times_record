import { CourseRecordResponse } from "@/types/course-record";
import { Overwrite, FormModel } from "@/utils/common";

type AddCourseRequest = FormModel<
	CourseRecordResponse,
	| "stuName"
	| "courseName"
	| "courseTotalTime"
	| "courseRemark"
	| "courseRestTime"
>;

export { AddCourseRequest };
