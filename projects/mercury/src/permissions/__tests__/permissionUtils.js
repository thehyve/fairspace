import {canAlterPermission, sortPermissions} from "../permissionUtils";

describe('permissionUtils', () => {
    describe('sortPermissions', () => {
        it('should sort first by access then by iri', () => {
            expect(sortPermissions([])).toEqual([]);
            expect(sortPermissions([{access: 'Read', iri: 's1'}, {access: 'Write', iri: 's2'}, {
                access: 'Manage',
                iri: 's3'
            }]))
                .toEqual([{access: 'Manage', iri: 's3'}, {access: 'Write', iri: 's2'}, {
                    access: 'Read',
                    iri: 's1'
                }]);
            expect(sortPermissions([{access: 'Read', iri: 's3'}, {access: 'Read', iri: 's1'}, {
                access: 'Read',
                iri: 's2'
            }]))
                .toEqual([{access: 'Read', iri: 's1'}, {access: 'Read', iri: 's2'}, {access: 'Read', iri: 's3'}]);
        });
    });

    describe('canAlterPermission', () => {
        it('should return false if user cannot manage the collection', () => {
            expect(canAlterPermission(false, {iri: 'subj1'}, {iri: 'subj2'})).toBe(false);
        });
        it('should return false for user\'s own permission', () => {
            expect(canAlterPermission(true, {iri: 'subj2'}, {iri: 'subj2'})).toBe(false);
        });
        it('should return true if user cannot manage the collection for someone else\' permission', () => {
            expect(canAlterPermission(true, {iri: 'subj1'}, {iri: 'subj2'})).toBe(true);
        });
    });
});
