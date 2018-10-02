import {sortAndFilterPermissions} from "./PermissionsContainer";

describe('PermissionsContainer', () => {
    describe('sortAndFilterPermissions', () => {
        const mockCollaborators = [
            {
                'collectionId': 500,
                'subject': 'user4-id',
                'access': 'Manage'
            },
            {
                'collectionId': 500,
                'subject': 'user1-id',
                'access': 'Write'
            },
            {
                'collectionId': 500,
                'subject': 'user3-id',
                'access': 'Read'
            },
            {
                'collectionId': 500,
                'subject': 'user2-id',
                'access': 'Manage'
            },
        ];
        const owner = 'user4-id';
        let test = sortAndFilterPermissions({data: mockCollaborators}, owner);
        const expected = [
            {
                'collectionId': 500,
                'subject': 'user2-id',
                'access': 'Manage'
            },
            {
                'collectionId': 500,
                'subject': 'user1-id',
                'access': 'Write'
            },
            {
                'collectionId': 500,
                'subject': 'user3-id',
                'access': 'Read'
            },
        ];

        it('should sort permission by access right order', () => {
            expect(test[0].subject).toEqual(expected[0].subject);
            expect(test[1].subject).toEqual(expected[1].subject);
            expect(test[2].subject).toEqual(expected[2].subject);
        });

        it('should exclude collection owner as collaborators', () => {
            expect(test.find(p => p.subject === owner)).toBeUndefined();
        });
    });
});
