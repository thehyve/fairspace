/* eslint-disable jest/expect-expect */
import React from 'react';
import {shallow} from "enzyme";

import {Button} from "@material-ui/core";
import CollaboratorsViewer from "../CollaboratorsViewer";
import PermissionsList from "../PermissionsList";

const testRenderingCollaborators = (wrapper, numberOfCollaborators) => {
    const permissionsListProps = wrapper.find(PermissionsList).first().props();
    expect(permissionsListProps.permissions.length).toBe(numberOfCollaborators);
    expect(permissionsListProps.selectedPrincipal).toBe(null);
};

const testOrderingOfCollaborators = (wrapper) => {
    const permissionsListProps = wrapper.find(PermissionsList).first().props();
    expect(permissionsListProps.permissions.map(p => p.iri)).toEqual(
        ['http://localhost/iri/user4-id', 'http://localhost/iri/user3-id']
    );
};

describe('CollaboratorsViewer', () => {
    const mockUsers = [
        {
            iri: 'http://localhost/iri/user2-id',
            access: 'Read',
            name: 'Michael Jackson'
        },
        {
            iri: 'http://localhost/iri/user3-id',
            access: 'Read',
            name: 'Bruno Mars'
        },
        {
            iri: 'http://localhost/iri/user1-id',
            access: 'Manage',
            name: 'Mariah Carey'
        },
        {
            iri: 'http://localhost/iri/user4-id',
            access: 'Manage',
            name: 'Kurt Cobain'
        }
    ];
    const mockCurrentUserCanManage = mockUsers[3];
    const mockCurrentUserCannotManage = mockUsers[1];
    const mockSetPermissionFn = jest.fn();
    const mockCollection = {
        iri: 'http://localhost/iri/c1',
        ownerWorkspace: 'http://localhost/iri/w1',
        access: 'Manage',
        canManage: true,
        userPermissions: [
            mockUsers[3],
            mockUsers[2],
            mockUsers[1],
            mockUsers[0]
        ],
        workspacePermissions: []
    };
    const mockWorkspaces = [
        {iri: 'http://localhost/iri/w1'},
        {iri: 'http://localhost/iri/w2'}
    ];
    const mockWorkspaceUsers = [
        mockUsers[3],
        mockUsers[1],
        mockUsers[0]
    ];
    const mockUsersWithCollectionAccess = [
        mockUsers[1],
        mockUsers[3]
    ];
    const mockWorkspaceWithCollectionAccess = null;

    describe('Use Case 1: Current user can manage collection', () => {
        let wrapper;
        beforeAll(() => {
            wrapper = shallow(
                <CollaboratorsViewer
                    currentUser={mockCurrentUserCanManage}
                    collection={mockCollection}
                    usersWithCollectionAccess={mockUsersWithCollectionAccess}
                    workspaceWithCollectionAccess={mockWorkspaceWithCollectionAccess}
                    workspaceUsers={mockWorkspaceUsers}
                    workspaces={mockWorkspaces}
                    setPermission={mockSetPermissionFn}
                />
            );
        });

        it('should render all collaborators', () => {
            testRenderingCollaborators(wrapper, 2);
        });

        it('should order permissions by the access rank (Manage-Write-Read)', () => {
            testOrderingOfCollaborators(wrapper);
        });

        it('should render add buttons', () => {
            expect(wrapper.find(Button).length).toEqual(2);
        });
    });

    describe('Use Case 2: Current user cannot manage collection', () => {
        let wrapper;
        beforeAll(() => {
            wrapper = shallow(
                <CollaboratorsViewer
                    currentUser={mockCurrentUserCannotManage}
                    collection={mockCollection}
                    usersWithCollectionAccess={mockUsersWithCollectionAccess}
                    workspaceWithCollectionAccess={mockWorkspaceWithCollectionAccess}
                    workspaceUsers={mockWorkspaceUsers}
                    workspaces={mockWorkspaces}
                    setPermission={mockSetPermissionFn}
                />
            );
        });

        it('should render all collaborators', () => {
            testRenderingCollaborators(wrapper, 2);
        });

        it('should order permissions by the access rank (Manage-Write-Read)', () => {
            testOrderingOfCollaborators(wrapper);
        });

        it('should NOT render add buttons', () => {
            expect(wrapper.find('[aria-label="Add"]').length).toEqual(0);
        });
    });

    describe('Access to a collection is added to a new user', () => {
        let wrapper;
        beforeAll(() => {
            wrapper = shallow(
                <CollaboratorsViewer
                    currentUser={mockCurrentUserCanManage}
                    collection={mockCollection}
                    usersWithCollectionAccess={[...mockUsersWithCollectionAccess, mockUsers[0]]}
                    workspaceWithCollectionAccess={mockWorkspaceWithCollectionAccess}
                    workspaceUsers={mockWorkspaceUsers}
                    workspaces={mockWorkspaces}
                    setPermission={mockSetPermissionFn}
                />
            );
        });

        it('should render all collaborators', () => {
            testRenderingCollaborators(wrapper, 3);
        });
    });

    describe('Access to a collection is added to an owner workspace', () => {
        let wrapper;
        beforeAll(() => {
            wrapper = shallow(
                <CollaboratorsViewer
                    currentUser={mockCurrentUserCannotManage}
                    collection={mockCollection}
                    usersWithCollectionAccess={mockUsersWithCollectionAccess}
                    workspaceWithCollectionAccess={mockWorkspaces[0]}
                    workspaceUsers={mockWorkspaceUsers}
                    workspaces={mockWorkspaces}
                    setPermission={mockSetPermissionFn}
                />
            );
        });

        it('should render all collaborators', () => {
            testRenderingCollaborators(wrapper, 3);
        });
    });
});
