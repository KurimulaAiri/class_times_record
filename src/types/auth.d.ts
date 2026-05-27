interface LoginByPwdRequest {
	role: number;
	account: string;
	password: string;
	institutionId: number;
	openId: string;
	needValidateAdmin: boolean;
}

interface LoginByTokenRequest {
	token: string;
	openId: string;
	needValidateAdmin: boolean;
}

interface RefreshTokenRequest {
	token: string;
}
