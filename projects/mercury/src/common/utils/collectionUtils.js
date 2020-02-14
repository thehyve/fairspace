import {workspacePrefix} from "../../workspaces/workspaces";
import {buildSearchUrl} from "../index";

export const getCollectionAbsolutePath = (location, workspace = null) => (
    (workspace ? workspacePrefix(workspace) : workspacePrefix()) + (location ? `/collections/${location}` : ''));

export const handleCollectionSearchRedirect = (history, value) => {
    const searchUrl = value ? buildSearchUrl(value) : '';
    history.push(`${workspacePrefix()}/collections${searchUrl}`);
};
