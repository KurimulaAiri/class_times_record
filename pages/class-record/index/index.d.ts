import {
	CourseRecord,
	GetCourseRecordResponse,
} from "@/types/course-record.d.ts";

type CourseRecordList = CourseRecord[];

type GetCourseRecordForm = {
	stuName: string;
	courseName: string;
	courseRemark: string;
	courseStatus: number | null;
	currentPage: number;
	pageSize: number;
};

export {
	CourseRecordList,
	GetCourseRecordResponse,
	GetCourseRecordForm,
	CourseRecord,
};
