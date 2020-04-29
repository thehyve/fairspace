import React, {useState} from 'react';

import {mount} from "enzyme";
import {act} from "@testing-library/react";
import UsersContext from "../../../users/UserContext";
import PermissionContext, {PermissionProvider} from "../PermissionContext";

const defaultPermissions = [
    {
        user: "http://test/71cfdb89-1cb3-48e6-b0e1-e48ff1bb4245",
        access: "Manage",
        canManage: true,
        canRead: true,
        canWrite: true
    },
    {
        user: "http://test/256b8cc5-ee41-43e3-ac91-6ff7c1f0d3ea",
        access: "Read",
        canManage: false,
        canRead: true,
        canWrite: false
    },
    {
        user: "http://test/874e9480-96fc-4ce3-9fcd-d8b07323bf1d",
        access: "Write",
        canManage: false,
        canRead: true,
        canWrite: true
    },
];
const defaultUsers = [
    {
        iri: "http://test/71cfdb89-1cb3-48e6-b0e1-e48ff1bb4245",
        name: "Gregor Clegane"
    },
    {
        iri: "http://test/256b8cc5-ee41-43e3-ac91-6ff7c1f0d3ea",
        name: "Ygritte"
    },
];

describe('PermissionProvider', () => {
    const getPermissionsMock = jest.fn(() => Promise.resolve(defaultPermissions));

    it('updates permissions after users change', async () => {
        let permissionContextOutput;
        let updateUsers;

        const UsersProvider = ({children}) => {
            const [users, setUsers] = useState(defaultUsers);

            return (
                <UsersContext.Provider value={{users, setUsers}}>
                    {children}
                </UsersContext.Provider>
            );
        };

        await act(async () => {
            mount(
                <UsersProvider>
                    <UsersContext.Consumer>
                        {({setUsers}) => { updateUsers = setUsers; }}
                    </UsersContext.Consumer>
                    <PermissionProvider getPermissions={getPermissionsMock}>
                        <PermissionContext.Consumer>
                            {value => { permissionContextOutput = value; }}
                        </PermissionContext.Consumer>
                    </PermissionProvider>
                </UsersProvider>
            );
        });

        // Expect the user names to be added to the permissions. One of the
        // permissions does not have a user associated
        expect(permissionContextOutput.permissions.length).toEqual(3);
        expect(permissionContextOutput.permissions.map(p => p.name)).toEqual(expect.arrayContaining([
            "Ygritte",
            "Gregor Clegane",
            ""
        ]));

        act(() => {
            updateUsers([
                ...defaultUsers,
                {
                    iri: 'http://test/874e9480-96fc-4ce3-9fcd-d8b07323bf1d',
                    name: 'Updated user'
                }
            ]);
        });

        // Expect the user names to be added to the permissions. One of the
        // permissions does not have a user associated
        expect(permissionContextOutput.permissions.map(p => p.name)).toEqual(expect.arrayContaining([
            "Ygritte",
            "Gregor Clegane",
            "Updated user"
        ]));
    });
});
