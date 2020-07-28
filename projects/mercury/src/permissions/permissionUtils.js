import {comparing, compareBy} from "../common/utils/genericUtils";

export const AccessRights = ['List', 'Read', 'Write', 'Manage'];

const permissionLevel = access => AccessRights.indexOf(access);

export const sortPermissions = (permissions) => {
    if (!permissions) {
        return [];
    }

    return permissions.sort(comparing(compareBy(permissionLevel, false), compareBy('iri')));
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
