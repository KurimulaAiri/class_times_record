interface DeductByCoursePayload {
	courseId: number;
	students: StudentDeductRequest[];
	isValid: boolean;
}
