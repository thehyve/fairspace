import {buildSearchUrl} from "../search/searchUtils";
import {COMMENT_URI, LABEL_URI} from "../constants";
import type {
    AccessLevel,
    AccessMode,
    Collection,
    CollectionPermissions,
    Permission,
    PrincipalPermission,
    Status
} from "./CollectionAPI";
// eslint-disable-next-line import/no-cycle
import {accessLevels} from "./CollectionAPI";
import {compareBy, comparing} from "../common/utils/genericUtils";

export const getCollectionAbsolutePath = (location) => `/collections/${location}`;

export const handleCollectionSearchRedirect = (history, value) => {
    const searchUrl = value ? buildSearchUrl(value) : '';
    history.push(`/collections${searchUrl}`);
};

const permissionLevel = p => accessLevels.indexOf(p.access);
export const sortPermissions = (permissions) => {
    if (!permissions) {
        return [];
    }
    return permissions.sort(comparing(
        compareBy(permissionLevel, false),
        compareBy('name')
    ));
};
export const compareTo: boolean = (currentAccess, baseAccess) => (
    permissionLevel(currentAccess) >= permissionLevel(baseAccess)
);
/**
 * Check if collaborator can alter permission. User can alter permission if:
 * - has manage access to a resource
 * - permission is not his/hers
 */
export const canAlterPermission = (canManage, user, currentLoggedUser) => {
    const isSomeoneElsePermission = currentLoggedUser.iri !== user.iri;
    return canManage && isSomeoneElsePermission;
};
export const mapPrincipalPermission: PrincipalPermission = (principalProperties, access: AccessLevel = null) => ({
    iri: principalProperties.iri,
    name: principalProperties.name,
    access
});
export const getPrincipalsWithCollectionAccess: PrincipalPermission = (principals, permissions: Permission[]) => {
    const results = [];
    principals.forEach(u => {
        const permission = permissions.find(p => p.iri === u.iri);
        if (permission) {
            results.push(mapPrincipalPermission(u, permission.access));
        }
    });
    return results;
};
export const getAccessModeDescription = (accessMode: AccessMode) => {
    switch (accessMode) {
        case "Restricted":
            return "collection data limited to users with explicitly granted access";
        case "MetadataPublished":
            return "all users can see collection metadata";
        case "DataPublished":
            return "all users can see collection data";
        default:
            return "unrecognized view mode.";
    }
};

export const mapCollectionPermissions: CollectionPermissions = (access) => ({
    canManage: compareTo({access}, {access: "Manage"}),
    canWrite: compareTo({access}, {access: "Write"}),
    canRead: compareTo({access}, {access: "Read"}),
});

export const mapCollectionNameAndDescriptionToMetadata = (name, description) => ({
    [LABEL_URI]: [{value: name}],
    [COMMENT_URI]: [{value: description}]
});

const parsePermissions = (value) => ((typeof value !== 'string')
    ? [] : value.split(',').map(s => s.split(' '))).map(([iri, access]) => ({iri, access}));

const parseToArray = value => ((typeof value !== 'string') ? [] : value.split(','));

export const mapFilePropertiesToCollection: Collection = (properties) => ({
    iri: properties.iri,
    name: properties.name,
    ownerWorkspace: properties.ownedBy,
    location: properties.basename,
    description: properties.comment,
    dateCreated: properties.creationdate,
    createdBy: properties.createdBy,
    dateModified: properties.lastmod,
    dateDeleted: properties.dateDeleted,
    accessMode: properties.accessMode,
    status: properties.status,
    canManageStatusAndMode: properties.canManageStatusAndMode,
    availableAccessModes: parseToArray(properties.availableAccessModes),
    availableStatuses: parseToArray(properties.availableStatuses),
    ...(properties.access && mapCollectionPermissions(properties.access)),
    userPermissions: parsePermissions(properties.userPermissions),
    workspacePermissions: parsePermissions(properties.workspacePermissions)
});

export const getStatusDescription = (status: Status) => {
    switch (status) {
        case "Active":
            return "Editing data and metadata enabled.";
        case "Archived":
            return "Data immutable, read-only.";
        case "Closed":
            return "Data not available for reading.";
        default:
            return "Unrecognized status";
    }
};
