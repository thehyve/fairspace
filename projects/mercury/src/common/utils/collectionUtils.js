import {workspacePrefix} from "../../workspaces/workspaces";

export const getCollectionAbsolutePath = (location) => workspacePrefix() + (location ? `/collections/${location}` : '');
