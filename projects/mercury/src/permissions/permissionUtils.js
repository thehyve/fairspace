import {compareBy, comparing} from "../common/utils/genericUtils";
import type {Access, AccessMode, Permission} from "../collections/CollectionAPI";

export type PrincipalType = "User" | "Workspace";

export type Principal = {|
    name: string;
    type: PrincipalType;
|};

export type PrincipalPermission = Permission & Principal;

export const AccessRights = ['Read', 'Write', 'Manage'];

const permissionLevel = p => AccessRights.indexOf(p.access);

export const sortPermissions = (permissions) => {
    if (!permissions) {
        return [];
    }
    return permissions.sort(comparing(
        compareBy('type', false),
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

export const mapPrincipalPermission: PrincipalPermission = (principalProperties, type: PrincipalType, access: Access = null) => ({
    iri: principalProperties.iri,
    name: principalProperties.name,
    type,
    access
});

export const getPrincipalsWithCollectionAccess: PrincipalPermission = (principals, permissions: Permission[], type: PrincipalType) => {
    const results = [];
    principals.forEach(u => {
        const permission = permissions.find(p => p.iri === u.iri);
        if (permission) {
            results.push(mapPrincipalPermission(u, type, permission.access));
        }
    });
    return results;
};

export const getAccessModeDescription = (accessMode: AccessMode) => {
    switch (accessMode) {
        case "Restricted":
            return "Collection data limited to users with explicitly granted access.";
        case "MetadataPublished":
            return "All users can see collection metadata";
        case "DataPublished":
            return "All users can see collection data";
        default:
            return "Unrecognized view mode";
    }
};
