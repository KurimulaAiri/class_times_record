interface RecordResponse {
	courseRecordId: number;
	createTimeStr: string;
	id: number;
	recordChange: number;
	recordRemark: string;
	recordTime: string;
	recordType: number;
	updateTimeStr: string;
}

type RecordListResponse = {
	records: RecordResponse[];
    total: number;
}
