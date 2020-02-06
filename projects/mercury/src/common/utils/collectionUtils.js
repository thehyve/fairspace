import {workspacePrefix} from "../../workspaces/workspaces";

export const getCollectionAbsolutePath = (location, workspace = null) => (
    (workspace ? workspacePrefix(workspace) : workspacePrefix()) + (location ? `/collections/${location}` : ''));
