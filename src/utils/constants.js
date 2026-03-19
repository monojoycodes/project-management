//tryna make the app scalable by having a systematic naming

export const UserRolesEnum = {
    ADMIN: "admin",
    PROJECT_ADMIN: "project_admin",
    MEMBER: "member"
} // basic object

export const AvailableUserRoles = Object.values(UserRolesEnum);
//creates an array of "values" from UserRoleEnum object and makes 
// them enummerable (iteratable).

export const TaskStatusEnum = {
    TODO: "todo",
    IN_PROGRESS: "in_progress",
    DONE: "done" 
}

export const AvailableTaskStatus = Object.values(TaskStatusEnum);