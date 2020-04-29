import {canAlterPermission, sortPermissions} from "../../../permissions/permissionUtils";

describe('permissionUtils', () => {
    describe('sortPermissions', () => {
        it('should sort first by access then by name', () => {
            expect(sortPermissions([])).toEqual([]);
            expect(sortPermissions([{access: 'Read', name: 's1'}, {access: 'Write', name: 's2'}, {
                access: 'Manage',
                name: 's3'
            }]))
                .toEqual([{access: 'Manage', name: 's3'}, {access: 'Write', name: 's2'}, {
                    access: 'Read',
                    name: 's1'
                }]);
            expect(sortPermissions([{access: 'Read', name: 's3'}, {access: 'Read', name: 's1'}, {
                access: 'Read',
                name: 's2'
            }]))
                .toEqual([{access: 'Read', name: 's1'}, {access: 'Read', name: 's2'}, {access: 'Read', name: 's3'}]);
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
