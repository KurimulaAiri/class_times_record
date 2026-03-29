type ApiResponse<T> = {
	code: number;
	message: string;
	data: T;
};

type LoginResponse = ApiResponse<{ token: string }>
