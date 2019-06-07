import getDisplayName from "../userUtils";

describe('usersUtils', () => {
    const mockUser = {
        id: "b4804cdb-b690-41ef-a167-6af7ed983d8d",
        createdTimestamp: 1538733234561,
        username: "user-workspace-ci",
        enabled: true,
        totp: false,
        emailVerified: false,
        firstName: "Daenarys",
        lastName: "Targaryen",
        email: "daenarys@thehyve.nl",
        disableableCredentialTypes: [
            "password"
        ],
        requiredActions: [],
        notBefore: 0,
        access: {
            manageGroupMembership: false,
            view: true,
            mapRoles: false,
            impersonate: false,
            manage: false
        }
    };

    describe('get full name', () => {
        it('should return full name', () => {
            const res = getDisplayName(mockUser);
            expect(res).toEqual('Daenarys Targaryen');
        });

        it('should return first name if last name not existing and vice versa', () => {
            mockUser.firstName = 'Daenarys';
            mockUser.lastName = undefined;
            expect(getDisplayName(mockUser)).toEqual('Daenarys');
            mockUser.firstName = undefined;
            mockUser.lastName = 'Targaryen';
            expect(getDisplayName(mockUser)).toEqual('Targaryen');
        });

        it('should return email when no names', () => {
            mockUser.lastName = undefined;
            expect(getDisplayName(mockUser)).toEqual('daenarys@thehyve.nl');
        });

        it('should return username when no names and email', () => {
            mockUser.email = undefined;
            expect(getDisplayName(mockUser)).toEqual('user-workspace-ci');
        });

        it('should return id when no names, email and username', () => {
            mockUser.username = undefined;
            expect(getDisplayName(mockUser)).toEqual('b4804cdb-b690-41ef-a167-6af7ed983d8d');
        });

        it('should return undefined when no names, email, username and id', () => {
            mockUser.id = undefined;
            expect(getDisplayName(mockUser)).toBeUndefined();
        });
    });
});
