type ApiResponse<T> = {
	code: number;
	message: string;
	data: T;
};

type LoginResponse = {
	accessToken: string
	refreshToken: string
	openId: string
	user: UserResponse
}
