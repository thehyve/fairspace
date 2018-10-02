import {
    applyDisableFilter,
    getNoOptionMessage,
    getUserLabelByUser,
    transformUserToOptions
} from "./AlterPermissionContainer";

describe('AlterPermissionContainer', () => {
    describe('transformUserToOptions', () => {
        const mockUsers = {
            data: [
                {id: 1, firstName: 'Mariah', lastName: 'Carey'},
                {id: 2, firstName: 'Michael', lastName: 'Jackson'}
            ]
        };
        it('should return empty array when there is no data', () => {
            const test = transformUserToOptions({data: []});
            expect(test.length).toBe(0);
        });
        it('should transform user data to [{label: string, value: any}', () => {
            const test = transformUserToOptions(mockUsers);
            const expected = [
                {label: 'Mariah Carey', value: 1},
                {label: 'Michael Jackson', value: 2},
            ];
            expect(test[0].label).toBe(expected[0].label);
            expect(test[0].value).toBe(expected[0].value);

            expect(test[1].label).toBe(expected[1].label);
            expect(test[1].value).toBe(expected[1].value);
        });
    });

    describe('getNoOptionMessage', () => {
        it('should return "No Options" when users is undefined', () => {
            const test = getNoOptionMessage();
            expect(test).toBe('No options');
        });
        it('should return "Loading .."  when users is pending', () => {
            const test = getNoOptionMessage({pending: true});
            expect(test).toBe('Loading ..');
        });
        it('should return "Error: Cannot fetch users."  when users is error', () => {
            const test = getNoOptionMessage({error: true});
            expect(test).toBe('Error: Cannot fetch users.');
        })
    });

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
            expect(test[0].disabled).toBeTruthy();
            expect(test[1].disabled).toBeTruthy();
            expect(test[2].disabled).toBeFalsy();
            expect(test[3].disabled).toBeTruthy();
            expect(test[4].disabled).toBeFalsy();
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
