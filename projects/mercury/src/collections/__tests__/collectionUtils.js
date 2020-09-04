import {canAlterPermission, getCollectionAbsolutePath, sortPermissions} from "../collectionUtils";

describe('Collection Utils', () => {
    describe('getCollectionAbsolutePath', () => {
        it('should return valid collection absolute path', () => {
            const location = "Jan_Smit_s_collection-500";

            expect(getCollectionAbsolutePath(location)).toBe('/collections/Jan_Smit_s_collection-500');
        });
    });
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
