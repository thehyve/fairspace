import {currentWorkspace} from "../../workspaces/workspaces";

export function getDisplayName(user) {
    return (user && (user.fullName || user.username)) || '';
}

export const workspaceRole = (user) => {
    const workspacePrefix = `workspace-${currentWorkspace()}-`;
    const role = user && user.authorizations && user.authorizations.find(r => r.startsWith(workspacePrefix));
    return role && role.substring(workspacePrefix.length);
};

export const isAdmin = (user) => user && user.authorizations && user.authorizations.includes('organisation-admin');
export const isDataSteward = (user) => ['datasteward', 'coordinator'].includes(workspaceRole(user));
export const isCoordinator = (user) => ['coordinator'].includes(workspaceRole(user));
export const canWrite = (user) => ['write', 'datasteward', 'coordinator'].includes(workspaceRole(user));
export const hasAccess = (user) => !!workspaceRole(user);
