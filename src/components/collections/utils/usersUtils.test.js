import {getFullname, getUserById} from "./usersUtils";

describe('usersUtils', () => {

    const mockUsers = [
        {
            "id": "13300b41-b4a0-463f-95aa-764d9efdc5cc",
            "createdTimestamp": 1536763434953,
            "username": "test2-workspace-ci",
            "enabled": true,
            "totp": false,
            "emailVerified": false,
            "firstName": "Ygritte",
            "lastName": "Lopez",
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
        },
        {
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
        },
    ];

    describe('getUserById', () => {
        it('should get user by id', () => {
            const res = getUserById(mockUsers, 'ab161dae-e402-4fd2-9d86-130387dc25ef');
            expect(res.username).toBe('test3-workspace-ci');
        });
        it('should return undefined if user is not found', () => {
            const res = getUserById(mockUsers, 'non-existing-user-id');
            expect(res).toBeUndefined();
        });
    })

    describe('getFullname', () => {
        it('should return full name', () => {
            const fullName = getFullname(mockUsers[1]);
            expect(fullName).toEqual('Daenarys Targaryen');
        });
        it('should return empty string if object does not have firstName and lastName', () => {
            const fullName = getFullname({id:'dummy'});
            expect(fullName).toEqual('');
        })
    });

});
