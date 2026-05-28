interface DeductByStudentPayload {
	studentId: number;
	classes: ClassDeductRequest[];
	isValid: boolean;
}
