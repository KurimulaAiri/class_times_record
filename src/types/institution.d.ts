interface InstitutionResponse {
    id: number;
    institutionName: string;
    institutionAddress: string;
    institutionCode: string;
    status: number;
    createTimeStr: string;
    updateTimeStr: string;
}

interface GetInstitutionByOpenIdRequest {
    openId: string;
}

interface GetInstitutionByOpenIdResponse {
    institutions: InstitutionResponse[];
}

interface GetInstitutionByCodeRequest {
    institutionCode: string;
}

interface GetInstitutionByCodeResponse {
    institutions: InstitutionResponse[];
}


