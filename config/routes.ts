// routes.ts
export const ROUTES = {
    INDEX: "/pages/index/index",
    LOGIN: "/pages/login/index",
    MAIN_INDEX: "/pages/main/index/index",
    CLASS_RECORD_INDEX: "/pages/class-record/index/index",
    CLASS_RECORD_DETAIL: "/pages/class-record/detail/index",
    CLASS_RECORD_EDIT: "/pages/class-record/edit/index",
    CLASS_RECORD_ADJUST: "/pages/class-record/adjust/index",
    CLASS_RECORD_ADD_COURSE: "/pages/class-record/add-course/index",
    MY_COURSE: "/pages/main/parent/my-course/index",
    MANAGE_STUDENT: "/pages/main/teacher/manage-student/index",
    EDIT_STUDENT_INFO: "/pages/main/parent/edit-student-info/index",
    OFFICIAL_STUDENT: "/pages/main/teacher/official-student/index",
    DEDUCT_FEE: "/pages/main/teacher/deduct-fee/index",
    FAST_DEDUCT: "/pages/main/teacher/fast-deduct/index",
    STUDENT_DETAIL: "/pages/main/teacher/student-detail/index",
    ADD_STUDENT: "/pages/main/teacher/add-student/index",
    CLASS_MANAGE: "/pages/main/teacher/class-manage/index",
    CLASS_DETAIL: "/pages/main/teacher/class-detail/index",
} as const;

export type PagePath = typeof ROUTES[keyof typeof ROUTES];