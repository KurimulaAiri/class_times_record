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
    MY_COURSE: "/pages/main/my-course/index",
    MANAGE_STUDENT: "/pages/main/manage-student/index",
    EDIT_STUDENT_INFO: "/pages/main/edit-student-info/index",
    OFFICIAL_STUDENT: "/pages/main/official-student/index",
    DEDUCT_FEE: "/pages/main/deduct-fee/index",
    FAST_DEDUCT: "/pages/main/fast-deduct/index",
    STUDENT_DETAIL: "/pages/main/student-detail/index",
} as const;

export type PagePath = typeof ROUTES[keyof typeof ROUTES];