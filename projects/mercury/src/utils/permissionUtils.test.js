import {canAlterPermission, MANAGE, READ, sortPermissions, WRITE} from "./permissionUtils";

describe('permissionUtils', () => {
    describe('sortPermissions', () => {
        it('should sort first by access then by subject', () => {
            expect(sortPermissions([])).toEqual([]);
            expect(sortPermissions([{access: READ, subject: 's1'}, {access: WRITE, subject: 's2'}, {
                access: MANAGE,
                subject: 's3'
            }]))
                .toEqual([{access: MANAGE, subject: 's3'}, {access: WRITE, subject: 's2'}, {
                    access: READ,
                    subject: 's1'
                }]);
            expect(sortPermissions([{access: READ, subject: 's3'}, {access: READ, subject: 's1'}, {
                access: READ,
                subject: 's2'
            }]))
                .toEqual([{access: READ, subject: 's1'}, {access: READ, subject: 's2'}, {access: READ, subject: 's3'}]);
        });
    });

    describe('canAlterPermission', () => {
        it('should return false if user cannot manage the collection', () => {
            expect(canAlterPermission(false, {subject: 'subj1'}, {id: 'subj2'})).toBe(false);
        });
        it('should return false for user\'s own permission', () => {
            expect(canAlterPermission(true, {subject: 'subj2'}, {id: 'subj2'})).toBe(false);
        });
        it('should return true if user cannot manage the collection for someone else\' permission', () => {
            expect(canAlterPermission(true, {subject: 'subj1'}, {id: 'subj2'})).toBe(true);
        });
    });
});
