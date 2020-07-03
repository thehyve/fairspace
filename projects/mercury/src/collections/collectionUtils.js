import {buildSearchUrl} from "../search/searchUtils";
import {COMMENT_URI, LABEL_URI} from "../constants";
import type {Collection, CollectionPermissions} from "./CollectionAPI";

export const getCollectionAbsolutePath = (location) => `/collections/${location}`;

export const handleCollectionSearchRedirect = (history, value) => {
    const searchUrl = value ? buildSearchUrl(value) : '';
    history.push(`/collections${searchUrl}`);
};

export const mapCollectionPermissions: CollectionPermissions = (access) => {
    const defaultAccess = {
        canManage: false,
        canWrite: false,
        canRead: false
    };
    if (access === 'Manage') {
        defaultAccess.canManage = true;
        defaultAccess.canWrite = true;
        defaultAccess.canRead = true;
    }
    if (access === 'Write') {
        defaultAccess.canWrite = true;
        defaultAccess.canRead = true;
    }
    if (access === 'Read') {
        defaultAccess.canRead = true;
    }
    return defaultAccess;
};

export const mapCollectionNameAndDescriptionToMetadata = (name, description) => ({
    [LABEL_URI]: [{value: name}],
    [COMMENT_URI]: [{value: description}]
});

export const mapFilePropertiesToCollection: Collection = (properties) => ({
    iri: properties.iri,
    name: properties.name,
    ownerWorkspace: properties.ownedBy,
    location: properties.basename,
    description: properties.comment,
    dateCreated: properties.creationdate,
    createdBy: properties.createdBy,
    dateModified: properties.lastmod,
    ...mapCollectionPermissions(properties.access)
});
