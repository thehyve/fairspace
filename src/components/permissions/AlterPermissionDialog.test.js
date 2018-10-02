
describe.skip('AlterPermissionDialog', () => {

    describe('applyDisableFilter', () => {
        const mockCollaborators = [
            {
                'collectionId': 500,
                'subject': 'user2-id',
                'access': 'Write'
            },
            {
                'collectionId': 500,
                'subject': 'user4-id',
                'access': 'Manage'
            }
        ];

        const options = [
            {label: 'Mariah Carey', value: 'user1-id'},
            {label: 'Michael Jackson', value: 'user2-id'},
            {label: 'Jlo', value: 'user3-id'},
            {label: 'Sarah Palin', value: 'user4-id'},
            {label: 'Donald Trump', value: 'user5-id'},
        ];

        const currentLoggedUser = {
            id: 'user1-id'
        };

        const collectionOwner = {
            id: 'user3-id'
        };

        it('should apply disable filter when user is collection owner', () => {
            const expected = [
                {label: 'Mariah Carey', value: 'user1-id', disabled: true}, // should be true because she's the
                // current logged user
                {label: 'Michael Jackson', value: 'user2-id', disabled: true}, // should be true because he's a
                // collaborator
                {label: 'Jlo', value: 'user3-id', disabled: true}, // should be true because she's the owner
                {label: 'Sarah Palin', value: 'user4-id', disabled: true}, // should be true because she's a
                // collaborator
                {label: 'Donald Trump', value: 'user5-id', disabled: false},
            ];
            const test = applyDisableFilter(options, mockCollaborators, currentLoggedUser, collectionOwner);
            expect(test).toEqual(expected)
        });
    });

    describe('getUserLabelByUser', () => {
        const user = {
            'collectionId': 500,
            'subject': 'user2-id',
            'access': 'Write'
        };
        const options = [
            {label: 'Michael Jackson', value: 'user2-id'},
            {label: 'Jlo', value: 'user3-id'},
            {label: 'Sarah Palin', value: 'user4-id'},
        ];

        it('should return user label', () => {
            const expected = 'Michael Jackson';
            expect(getUserLabelByUser(user, options)).toBe(expected);
        });

        it('should return empty string if user not found in the options', () => {
            user.subject = 'xxx-id';
            expect(getUserLabelByUser(user, options)).toBe('');
        });

    })
});