import { CourseRecordResponse, CourseRecordListResponse } from "@/types/course-record";

type AddRecordRequest = {
	courseRecordIdList: number[];
    recordTime: string;
    recordType: number;
	recordChange: number;
	recordRemark: string;
};

export { CourseRecordResponse, CourseRecordListResponse, AddRecordRequest };
