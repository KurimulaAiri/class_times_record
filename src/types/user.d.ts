interface BaseIdentity {
	userId: number;
	isAvailable: boolean;
	username: string;
}

interface ParentIdentity extends BaseIdentity {
	parentId: number;
}

interface TeacherIdentity extends BaseIdentity {
	institutionId: number;
	teacherId: number;
	username: string;
	institution: InstitutionResponse;
}

type UserResponse = {
	userId: number;
	createTimeStr: string;
	updateTimeStr: string;
} & (
	| { roleId: 3; identityInfo: ParentIdentity }
	| { roleId: 4; identityInfo: TeacherIdentity; admin: AdminResponse }
);
