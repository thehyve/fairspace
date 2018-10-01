
import {sortAndFilterPermissions} from "./Permissions";

describe('Permissions', () => {
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
        const owner = 'user-4-id';
        let test;

        beforeAll(() => {
            test = sortAndFilterPermissions(mockCollaborators, owner);
        });

        it('should sort permission by access right order', () => {

            expect()
        });
        it('should exclude collection owner as collaborators');
    });
});
