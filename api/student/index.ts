import { post } from "@/utils/request";
import { StudentListQueryForm, StudentListResponse } from "@/types/student";

const getStudentListByParentId = (QueryForm: StudentListQueryForm) => {
    return post<StudentListResponse>("/student/get_by_parent_id", QueryForm);
};

export { getStudentListByParentId };
