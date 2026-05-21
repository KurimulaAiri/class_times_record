import { post } from "@/utils/request";

const getCourseByInstitutionId = async (query: GetCourseByInstitutionIdForm) => {
	const res = await post<CoursesResponse>(`/course/get_course_by_institution_id`, query);
	return res.data;
};

export { getCourseByInstitutionId };