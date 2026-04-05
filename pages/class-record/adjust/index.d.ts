import { CourseRecord } from "@/types/course-record";

type AdjustList = CourseRecord[];
type CourseRecordList = CourseRecord[];

type GetRespDataCourseRecord = {
	courseRecords: CourseRecordList;
	total: number;
};

type addRecordForm = {
	courseRecordIdList: number[];
    recordTime: string;
    recordType: number;
	recordChange: number;
	recordRemark: string;
};

export { AdjustList, CourseRecordList, GetRespDataCourseRecord, addRecordForm, CourseRecord };
