import { post } from "@/utils/request";

const getCourseByInstitutionId = async (query: GetCourseByInstitutionIdRequest) => {
	const res = await post<CourseListResponse>(`/course/get_course_by_institution_id`, query);
	return res.data;
};

export { getCourseByInstitutionId };
