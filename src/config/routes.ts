// routes.ts
export const ROUTES = {
	INDEX: "/pages/index/index", // 首页
	LOGIN: "/pages/login/index", // 登录页
	MAIN_INDEX: "/pages/main/index/index", // 主页
	CLASS_RECORD_INDEX: "/pages/class-record/index/index", // 课时记录首页
	CLASS_RECORD_DETAIL: "/pages/class-record/detail/index", // 课时记录详情页
	CLASS_RECORD_EDIT: "/pages/class-record/edit/index", // 课时记录编辑页
	CLASS_RECORD_ADJUST: "/pages/class-record/adjust/index", // 课时记录调整页
	CLASS_RECORD_ADD_COURSE: "/pages/class-record/add-course/index", // 课时记录添加课程页
	MY_COURSE: "/pages/main/parent/my-course/index", // 家长端我的课程
	MANAGE_STUDENT: "/pages/main/teacher/manage-student/index", // 教师端管理学生
	EDIT_STUDENT_INFO: "/pages/main/parent/edit-student-info/index", // 家长端编辑学生信息
	OFFICIAL_STUDENT: "/pages/main/teacher/official-student/index", // 教师端正式学生
	DEDUCT_FEE: "/pages/main/teacher/deduct-fee/index", // 教师端扣费
	FAST_DEDUCT: "/pages/main/teacher/fast-deduct/index", // 教师端快速扣费
	STUDENT_DETAIL: "/pages/main/teacher/student-detail/index", // 教师端学生详情
	ADD_STUDENT: "/pages/main/teacher/add-student/index", // 教师端添加学生
	CLASS_MANAGE: "/pages/main/teacher/class-manage/index", // 教师端班级管理
	CLASS_DETAIL: "/pages/main/teacher/class-detail/index", // 教师端班级详情
	ADD_CLASS: "/pages/main/teacher/add-class/index", // 教师端添加班级
	SCHOOL_SCHEDULE: "/pages/main/teacher/school-schedule/index", // 教师端学校课表
	SELECT_COURSE: "/pages/main/teacher/select-course/index", // 教师端选择课程
	SELECT_TEACHER: "/pages/main/teacher/select-teacher/index", // 教师端选择老师
	PRIVACY: "/pages/privacy/index", // 隐私政策页
	USER_AGREEMENT: "/pages/user-agreement/index", // 用户服务协议页
	COURSE_MANAGE: "/pages/main/teacher/course-manage/index", // 教师端课程管理
	EDIT_STUDENT_INFO_TEACHER: "/pages/main/teacher/edit-student-info/index", // 教师端编辑学生信息
	SELECT_STUDENT: "/pages/main/teacher/select-student/index", // 教师端选择学生
	EDIT_CLASS_INFO: "/pages/main/teacher/edit-class-info/index", // 教师端编辑班级信息
	ADD_COURSE: "/pages/main/teacher/add-course/index", // 教师端添加课程
	COURSE_DETAIL: "/pages/main/teacher/course-detail/index", // 教师端课程详情
	SELECT_CLASS: "/pages/main/teacher/select-class/index", // 教师端选择班级
	LEAVE_MANAGE: "/pages/main/teacher/leave-manage/index", // 教师端请假管理
	ADJUST_CLASS_SCHEDULE: "/pages/main/teacher/adjust-class-schedule/index", // 教师端调整排课
	EDIT_COURSE_INFO: "/pages/main/teacher/edit-course-info/index", // 教师端编辑课程信息
	INSTITUTION_DETAIL: "/pages/main/teacher/institution-detail/index", // 教师端校区详情
	MY_SCHEDULE: "/pages/main/teacher/my-schedule/index", // 教师端我的课表
	EDIT_INSTITUTION_INFO: "/pages/main/teacher/edit-institution-info/index", // 教师端编辑校区信息
	ADD_COURSE_RECORD: "/pages/main/teacher/add-course-record/index", // 教师端添加学生课程
	EDIT_CLASS_SCHEDULE_INFO:
		"/pages/main/teacher/edit-class-schedule-info/index", // 教师端编辑班级课表
	SELECT_COURSE_RECORD: "/pages/main/teacher/select-course-record/index", // 教师端选择学生课程
	MANAGE_COURSE_RECORD: "/pages/main/teacher/manage-course-record/index", // 教师端管理学生课程
	EDIT_COURSE_RECORD_INFO: "/pages/main/teacher/edit-course-record-info/index", // 教师端编辑学生课程信息
	MANAGE_TEACHER: "/pages/main/teacher/manage-teacher/index", // 教师端管理老师
	USER_PROFILE: "/pages/main/teacher/user-profile/index", // 教师端用户信息
} as const;

export type PagePath = (typeof ROUTES)[keyof typeof ROUTES];
