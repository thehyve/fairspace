import {compareBy, comparing} from "./comparisionUtils";

export const MANAGE = 'Manage';
export const WRITE = 'Write';
export const READ = 'Read';

export const canWrite = (collection) => collection
    && (collection.access === MANAGE || collection.access === WRITE);

export const canManage = (collection) => collection && collection.access === MANAGE;

const permissionLevel = p => ({Manage: 0, Write: 1, Read: 2}[p.access]);

export const sortPermissions = (permissions) => {
    if (!permissions) {
        return [];
    }

    return permissions.sort(comparing(compareBy(permissionLevel), compareBy('subject')));
};

/**
 * Check if collaborator can alter permission. User can alter permission if:
 * - has manage access to a collection
 * - permission is not his/hers
 */
export const canAlterPermission = (userCanManage, permission, currentLoggedUser) => {
    const isSomeoneElsePermission = currentLoggedUser.id !== permission.subject;
    return userCanManage && isSomeoneElsePermission;
};
