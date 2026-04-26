type ApiResponse<T> = {
	code: number;
	message: string;
	data: T;
};

type LoginResponse = {
	token: string
	openId: string
	user: User
}
