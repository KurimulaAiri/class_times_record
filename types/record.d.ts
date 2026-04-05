interface Record {
	courseRecordId: number;
	createTimeStr: string;
	id: number;
	recordChange: number;
	recordRemark: string;
	recordTime: string;
	recordType: number;
	updateTimeStr: string;
}

type GetRecordResponse = {
	records: Record[];
    total: number;
}

export { Record, GetRecordResponse };
