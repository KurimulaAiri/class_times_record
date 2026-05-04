// 1. 基础字段
interface BaseIdentity {
    userId: number;
    isAvailable: boolean;
    username: string;
}

// 2. 各角色独有的 Identity 字段（不再包含 roleId）
interface ParentIdentity extends BaseIdentity {
    parentId: number;
}

interface TeacherIdentity extends BaseIdentity {
    teacherId: number;
}

// 3. 核心：通过 User 的 roleId 决定 identityInfo 的类型
type User = {
    userId: number;
    createTimeStr: string;
    updateTimeStr: string;
} & (
    | { roleId: 3; identityInfo: ParentIdentity }  // 当 roleId 为 3，指定为家长
    | { roleId: 4; identityInfo: TeacherIdentity } // 当 roleId 为 4，指定为老师
);