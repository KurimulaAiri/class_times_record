interface CoursesResponse {
	courses: CourseResponse[];
    total: number;
}

interface CourseResponse {
	id: number;
	courseName: string;
    courseType: number;
    available: boolean;
    institution: Institution;
}



interface GetCourseByInstitutionIdForm {
	institutionId: number;
    currentPage: number;
    pageSize: number;
}