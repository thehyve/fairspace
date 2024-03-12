import React from 'react';
import {Create, MenuBook, Settings, Toc} from '@mui/icons-material';
// eslint-disable-next-line import/no-cycle
import type {
    AccessLevel,
    AccessMode,
    Collection,
    CollectionPermissions,
    Permission,
    PrincipalPermission,
    Status
} from './CollectionAPI';
// eslint-disable-next-line import/no-cycle
import {accessLevels} from './CollectionAPI';
import {compareBy, comparing} from '../common/utils/genericUtils';
// eslint-disable-next-line import/no-cycle
import {encodePath} from '../file/fileUtils';
import {isAdmin} from '../users/userUtils';

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

/**
 * Check if collaborator can alter permission. User can alter permission if:
 * - has manage access to a resource
 * - permission is not his/hers, unless is admin
 */
export const canAlterPermission = (canManage, user, currentLoggedUser) => {
    const isSomeoneElsePermission = currentLoggedUser.iri !== user.iri;
    return canManage && (isSomeoneElsePermission || !!isAdmin(user));
};

export const mapPrincipalPermission: PrincipalPermission = (principalProperties, access: AccessLevel = null) => ({
    iri: principalProperties.iri,
    name: principalProperties.code ? principalProperties.code : principalProperties.name,
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
        case 'Restricted':
            return 'Data and metadata not public available, users need explicitly granted access.';
        case 'MetadataPublished':
            return 'All users can see collection metadata.';
        case 'DataPublished':
            return 'For read-only collections, all users can see collection data and metadata.';
        default:
            return '';
    }
};

const parsePermissions = (value) => ((typeof value !== 'string')
    ? [] : value.split(',').map(s => s.split(' '))).map(([iri, access]) => ({iri, access}));

const parseToArray = value => ((typeof value !== 'string') ? [] : value.split(','));

export const mapFilePropertiesToCollection: Collection = (properties) => ({
    iri: properties.iri,
    name: properties.basename,
    ownerWorkspace: properties.ownedBy,
    ownerWorkspaceCode: properties.ownedByCode,
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
    canUnpublish: properties.canUnpublish?.toLowerCase() === 'true',
    access: properties.access,
    availableAccessModes: parseToArray(properties.availableAccessModes),
    availableStatuses: parseToArray(properties.availableStatuses),
    userPermissions: parsePermissions(properties.userPermissions),
    workspacePermissions: parsePermissions(properties.workspacePermissions)
});

export const descriptionForStatus = (status: Status) => {
    switch (status) {
        case 'Active':
            return 'Editing data and metadata enabled.';
        case 'ReadOnly':
            return 'Data immutable, available only for reading.';
        case 'Archived':
            return 'Data not available for reading.';
        default:
            return '';
    }
};
