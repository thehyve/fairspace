import {currentWorkspace} from "../../workspaces/workspaces";

export default function getDisplayName(user) {
    return (user && user.name) || '';
}

export const isDataSteward = (authorizations) => authorizations && authorizations.includes(`workspace-${currentWorkspace()}-datasteward`);
export const isCoordinator = (authorizations) => authorizations && authorizations.includes(`workspace-${currentWorkspace()}-coordinator`);
export const canWrite = (authorizations) => authorizations && authorizations.includes(`workspace-${currentWorkspace()}-write`);
