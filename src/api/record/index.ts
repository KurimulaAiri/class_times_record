import { post } from "@/utils/request";

const getRecordList = async (
	params: GetRecordListRequest,
): Promise<RecordResponse[]> => {
	return (await post<RecordListResponse>("/record/new_get", params)).data.records;
};

export { getRecordList };