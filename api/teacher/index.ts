import { post } from "@/utils/request";

const getTeacherById = async (id: number): Promise<TeacherResponse> => {
	// 直接 await 获取 res
	const res = await post<TeachersResponse>(`/teacher/get_by_id`, {
		teacherId: id,
	});

	console.log("加载老师数据:", res.data);

	// 直接返回 res.data，它已经包含了嵌套的 institution 对象
	return res.data.teachers[0];
};

export { getTeacherById };
