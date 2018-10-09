import {getFullname} from "./userUtils";

describe('usersUtils', () => {

    const mockUser = {
        "id": "ab161dae-e402-4fd2-9d86-130387dc25ef",
        "createdTimestamp": 1536763439108,
        "username": "test3-workspace-ci",
        "enabled": true,
        "totp": false,
        "emailVerified": false,
        "firstName": "Daenarys",
        "lastName": "Targaryen",
        "disableableCredentialTypes": [
            "password"
        ],
        "requiredActions": [],
        "notBefore": 0,
        "access": {
            "manageGroupMembership": false,
            "view": true,
            "mapRoles": false,
            "impersonate": false,
            "manage": false
        }
    };

    describe('getFullname', () => {
        it('should return full name', () => {
            const fullName = getFullname(mockUser);
            expect(fullName).toEqual('Daenarys Targaryen');
        });
        it('should return empty string if object does not have firstName and lastName', () => {
            const fullName = getFullname({id: 'dummy'});
            expect(fullName).toEqual('');
        })
    });

});
