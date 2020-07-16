import type {User} from "./UsersAPI";
import type {WorkspaceUser} from "../workspaces/WorkspacesAPI";

export function getDisplayName(user) {
    return (user && user.name) || '';
}

export function getEmail(user) {
    return (user && user.email) || '';
}

export const isAdmin = (user) => user && user.admin;
export const isDataSteward = (user) => isAdmin(user);

export const getWorkspaceUsersWithRoles = (users: User[], workspaceUsers: WorkspaceUser[]) => {
    const members = [];
    users.forEach(u => {
        const workspaceUser = workspaceUsers.find(wu => wu.iri === u.iri);
        if (workspaceUser) {
            members.push({...u, role: workspaceUser.role});
        }
    });
    return members;
};
