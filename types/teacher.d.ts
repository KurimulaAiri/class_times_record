interface TeachersResponse {
    teachers: TeacherResponse[]
    total: number
}

interface TeacherResponse {
    teacherId: number,
    username: string,
    institution: Institution
}