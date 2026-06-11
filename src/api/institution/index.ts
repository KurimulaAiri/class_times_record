import { post } from "@/utils/request";

const getInstitutionById = async (
	data: GetInstitutionByIdRequest,
): Promise<InstitutionResponse | null> => {
	try {
		const res = await post<GetInstitutionByIdResponse>(
			`/biz/institution/get_by_id`,
			data,
		);
		console.log("getInstitutionById 响应:", res);
		return res.data.institutions[0] || null;
	} catch (error) {
		console.error(error);
		return null;
	}
};

const getInstitutionByOpenId = async (
	data: GetInstitutionByOpenIdRequest,
): Promise<InstitutionResponse[]> => {
	// 💡 提取平台变量，避免把条件编译直接塞进对象字面量中引起 AST 解析 Bug
	let platform = "";
	// #ifdef MP-WEIXIN
	platform = "WEIXIN";
	// #endif

	try {
		const res = await post<GetInstitutionByOpenIdResponse>(
			`/biz/institution/get_by_open_id`,
			{
				...data,
				platform: platform,
			},
		);
		// 确保安全返回数组类型
		return res?.data?.institutions || [];
	} catch (error) {
		console.error("获取机构失败:", error);
		return [];
	}
};

const getInstitutionByCode = async (
	data: GetInstitutionByCodeRequest,
): Promise<InstitutionResponse | null> => {
	try {
		const res = await post<GetInstitutionByCodeResponse>(
			`/biz/institution/get_by_institution_code`,
			data,
		);
		// 确保数组有数据时才返回第一项
		if (res?.data?.institutions && res.data.institutions.length > 0) {
			return res.data.institutions[0];
		}
		return null;
	} catch (error) {
		console.error(error);
		return null;
	}
};

const updateInstitution = async (
	data: UpdateInstitutionRequest,
): Promise<UpdateInstitutionResponse> => {
	let res = {} as UpdateInstitutionResponse;
	try {
		const resIn = await post<UpdateInstitutionResponse>(
			`/biz/institution/update`,
			data,
		);
		res = resIn?.data || {};
		return res;
	} catch (error) {
		console.error(error);
		return res;
	}
};

export {
	getInstitutionByOpenId,
	getInstitutionByCode,
	updateInstitution,
	getInstitutionById,
};
