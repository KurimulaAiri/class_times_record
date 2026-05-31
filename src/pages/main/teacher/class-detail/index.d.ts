interface PeriodItem {
	dateKey: string;
	startDate: string;
	endDate: string;
	remark?: string;
	timeSlots: ClassScheduleResponse[];
}
