import {canAlterPermission, sortPermissions} from "./permissionUtils";

describe('permissionUtils', () => {
    describe('sortPermissions', () => {
        it('should sort first by access then by user', () => {
            expect(sortPermissions([])).toEqual([]);
            expect(sortPermissions([{access: 'Read', user: 's1'}, {access: 'Write', user: 's2'}, {
                access: 'Manage',
                user: 's3'
            }]))
                .toEqual([{access: 'Manage', user: 's3'}, {access: 'Write', user: 's2'}, {
                    access: 'Read',
                    user: 's1'
                }]);
            expect(sortPermissions([{access: 'Read', user: 's3'}, {access: 'Read', user: 's1'}, {
                access: 'Read',
                user: 's2'
            }]))
                .toEqual([{access: 'Read', user: 's1'}, {access: 'Read', user: 's2'}, {access: 'Read', user: 's3'}]);
        });
    });

    describe('canAlterPermission', () => {
        it('should return false if user cannot manage the collection', () => {
            expect(canAlterPermission(false, {user: 'subj1'}, {iri: 'subj2'})).toBe(false);
        });
        it('should return false for user\'s own permission', () => {
            expect(canAlterPermission(true, {user: 'subj2'}, {iri: 'subj2'})).toBe(false);
        });
        it('should return true if user cannot manage the collection for someone else\' permission', () => {
            expect(canAlterPermission(true, {user: 'subj1'}, {iri: 'subj2'})).toBe(true);
        });
    });
});
