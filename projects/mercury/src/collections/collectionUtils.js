import {buildSearchUrl} from "../search/searchUtils";
import {COMMENT_URI, LABEL_URI} from "../constants";
import {compareTo} from "../permissions/permissionUtils";
import type {Collection, CollectionPermissions} from "./CollectionAPI";

export const getCollectionAbsolutePath = (location) => `/collections/${location}`;

export const handleCollectionSearchRedirect = (history, value) => {
    const searchUrl = value ? buildSearchUrl(value) : '';
    history.push(`/collections${searchUrl}`);
};

export const mapCollectionPermissions: CollectionPermissions = (access) => ({
    canManage: compareTo(access, "Manage"),
    canWrite: compareTo(access, "Write"),
    canRead: compareTo(access, "Read"),
});

export const mapCollectionNameAndDescriptionToMetadata = (name, description) => ({
    [LABEL_URI]: [{value: name}],
    [COMMENT_URI]: [{value: description}]
});

const parseCommaSeparatedString = value => (
    value.split(',').map(s => s.split(' ')));

const parsePermissions = (value) => ((typeof value !== 'string')
    ? [] : parseCommaSeparatedString(value).map(([iri, access]) => ({iri, access})));

const parseToArray = value => ((typeof value !== 'string')
    ? [] : parseCommaSeparatedString(value));

export const mapFilePropertiesToCollection: Collection = (properties) => ({
    iri: properties.iri,
    name: properties.name,
    ownerWorkspace: properties.ownedBy,
    location: properties.basename,
    description: properties.comment,
    dateCreated: properties.creationdate,
    createdBy: properties.createdBy,
    dateModified: properties.lastmod,
    accessMode: properties.accessMode,
    status: properties.status,
    accessModes: properties.accessModes,
    availableAccessModes: parseToArray(properties.availableAccessModes),
    availableStatuses: parseToArray(properties.availableStatuses),
    ...(properties.access && mapCollectionPermissions(properties.access)),
    userPermissions: parsePermissions(properties.userPermissions),
    workspacePermissions: parsePermissions(properties.workspacePermissions)
});
