import {buildSearchUrl} from "../search/searchUtils";
import {COMMENT_URI, LABEL_URI} from "../constants";
import {compareTo} from "../permissions/permissionUtils";
import type {Collection, CollectionPermissions} from "./CollectionAPI";

export const getCollectionAbsolutePath = (location) => `/collections/${location}`;

export const handleCollectionSearchRedirect = (history, value) => {
    const searchUrl = value ? buildSearchUrl(value) : '';
    history.push(`/collections${searchUrl}`);
};

export const mapCollectionPermissions: CollectionPermissions = (access) => {
    return {
        canManage: compareTo(access, "Manage"),
        canWrite: compareTo(access, "Write"),
        canRead: compareTo(access, "Read"),
        canList: compareTo(access, "List"),
    };
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
