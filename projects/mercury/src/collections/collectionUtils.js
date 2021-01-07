import React from "react";
import queryString from "query-string";
import {Create, MenuBook, Settings, Toc} from "@material-ui/icons";
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
import {encodePath, getParentPath} from '../file/fileUtils';
import {COLLECTION_URI} from "../constants";

export const isCollectionPage = () => {
    const {pathname} = new URL(window.location);
    const parts = pathname.split('/');
    if (parts.length > 0 && parts[0] === '') {
        parts.splice(0, 1);
    }
    return (parts.length > 1 && parts[0] === 'collections');
};

export const getCollectionAbsolutePath = (path: string) => (
    `/collections/${encodePath(path)}`
);

export const pathForIri = (iri: string) => {
    const path = decodeURIComponent(new URL(iri).pathname);
    return path.replace('/api/v1/webdav/', '');
};

export const redirectLink = (iri: string, type: string) => {
    const path = pathForIri(iri);
    if (type && type === COLLECTION_URI) {
        return getCollectionAbsolutePath(path);
    }
    const parentPath = getParentPath(path);
    return `${getCollectionAbsolutePath(parentPath)}?selection=${encodeURIComponent(`/${path}`)}`;
};

export const getSearchPathSegments = (context) => {
    const segments = ((context && pathForIri(context)) || '').split('/');
    const result = [];
    if (segments[0] === '') {
        result.push({label: 'Search results', href: ''});
        return result;
    }
    let href = '/collections';
    segments.forEach(segment => {
        href += '/' + segment;
        result.push({label: segment, href});
    });
    result.push({label: 'Search results', href: ''});
    return result;
};

export const handleCollectionTextSearchRedirect = (history, value, context = '') => {
    if (value) {
        history.push('/collections-search/?' + queryString.stringify({q: value, context}));
    } else {
        history.push(`/collections/${context ? pathForIri(context) : ''}`);
    }
};

export const collectionAccessIcon = (access: AccessLevel, fontSize: 'inherit' | 'default' | 'small' | 'large' = 'default') => {
    switch (access) {
        case 'List':
            return <Toc titleAccess={`${access} access`} fontSize={fontSize} />;
        case 'Read':
            return <MenuBook titleAccess={`${access} access`} fontSize={fontSize} />;
        case 'Write':
            return <Create titleAccess={`${access} access`} fontSize={fontSize} />;
        case 'Manage':
            return <Settings titleAccess={`${access} access`} fontSize={fontSize} />;
        case 'None':
        default:
            return <></>;
    }
};

export const accessLevelForCollection = (collection: CollectionPermissions): AccessLevel => {
    if (collection.canManage) {
        return 'Manage';
    }
    if (collection.canWrite) {
        return 'Write';
    }
    if (collection.canRead) {
        return 'Read';
    }
    return 'List';
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

export const descriptionForAccessMode = (accessMode: AccessMode) => {
    switch (accessMode) {
        case "Restricted":
            return "Access to data limited to users with explicitly granted access.";
        case "MetadataPublished":
            return "All users can see collection metadata.";
        case "DataPublished":
            return "All users can see collection data.";
        default:
            return "";
    }
};

const parsePermissions = (value) => ((typeof value !== 'string')
    ? [] : value.split(',').map(s => s.split(' '))).map(([iri, access]) => ({iri, access}));

const parseToArray = value => ((typeof value !== 'string') ? [] : value.split(','));

export const mapFilePropertiesToCollection: Collection = (properties) => ({
    iri: properties.iri,
    name: properties.basename,
    ownerWorkspace: properties.ownedBy,
    ownerWorkspaceName: properties.ownedByName,
    description: properties.comment,
    dateCreated: properties.creationdate,
    createdBy: properties.createdBy,
    dateModified: properties.lastmod,
    dateDeleted: properties.dateDeleted,
    deletedBy: properties.deletedBy,
    accessMode: properties.accessMode,
    status: properties.status,
    canRead: (properties.canRead?.toLowerCase() === 'true'),
    canWrite: (properties.canWrite?.toLowerCase() === 'true'),
    canManage: (properties.canManage?.toLowerCase() === 'true'),
    canDelete: properties.canDelete?.toLowerCase() === 'true',
    canUndelete: properties.canUndelete?.toLowerCase() === 'true',
    access: properties.access,
    availableAccessModes: parseToArray(properties.availableAccessModes),
    availableStatuses: parseToArray(properties.availableStatuses),
    userPermissions: parsePermissions(properties.userPermissions),
    workspacePermissions: parsePermissions(properties.workspacePermissions)
});

export const descriptionForStatus = (status: Status) => {
    switch (status) {
        case "Active":
            return "Editing data and metadata enabled.";
        case "Archived":
            return "Data immutable, read-only.";
        case "Closed":
            return "Data not available for reading.";
        default:
            return "";
    }
};
