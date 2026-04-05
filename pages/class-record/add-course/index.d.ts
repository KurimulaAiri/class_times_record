import { CourseRecord } from "@/types/course-record";
import { Overwrite, FormModel } from "@/utils/common";

type AddCourseRequest = FormModel<
	CourseRecord,
	| "stuName"
	| "courseName"
	| "courseTotalTime"
	| "courseRemark"
	| "courseRestTime"
>;

export { AddCourseRequest };
