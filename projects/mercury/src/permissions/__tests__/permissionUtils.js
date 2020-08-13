import {canAlterPermission, sortPermissions} from "../permissionUtils";

describe('permissionUtils', () => {
    describe('sortPermissions', () => {
        it('should sort first by access then by name', () => {
            expect(sortPermissions([])).toEqual([]);

            expect(sortPermissions([
                {access: 'Read', name: 's1'},
                {access: 'Write', name: 's2'},
                {access: 'Manage', name: 's3'}
            ])).toEqual([
                {access: 'Manage', name: 's3'},
                {access: 'Write', name: 's2'},
                {access: 'Read', name: 's1'}
            ]);

            expect(sortPermissions([
                {access: 'Read', name: 's3'},
                {access: 'Read', name: 's1'},
                {access: 'Read', name: 's2'}
            ])).toEqual([
                {access: 'Read', name: 's1'},
                {access: 'Read', name: 's2'},
                {access: 'Read', name: 's3'}
            ]);
        });

        it('should sort first by type then by access and name', () => {
            expect(sortPermissions([
                {access: 'Read', name: 's1', type: 'User'},
                {access: 'Write', name: 's2', type: 'Workspace'},
                {access: 'Manage', name: 's3', type: 'User'}
            ])).toEqual([
                {access: 'Write', name: 's2', type: 'Workspace'},
                {access: 'Manage', name: 's3', type: 'User'},
                {access: 'Read', name: 's1', type: 'User'}
            ]);
        });
    });

    describe('canAlterPermission', () => {
        it('should return false if user cannot manage the collection', () => {
            expect(canAlterPermission(false, {iri: 'subj1'}, {iri: 'subj2'})).toBe(false);
        });
        it('should freturn false for user\'s own permission', () => {
            expect(canAlterPermission(true, {iri: 'subj2'}, {iri: 'subj2'})).toBe(false);
        });
        it('should return true if user cannot manage the collection for someone else\' permission', () => {
            expect(canAlterPermission(true, {iri: 'subj1'}, {iri: 'subj2'})).toBe(true);
        });
    });
});
