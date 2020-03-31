/* eslint-disable jest/expect-expect */
import React from 'react';
import {shallow} from "enzyme";

import {Button, IconButton} from "@material-ui/core";
import PermissionsViewer from "../PermissionsViewer";

const testRenderingCollaborators = (wrapper) => {
    expect(wrapper.find('[data-testid="collaborator"]').length).toBe(4);
};

const testOrderingOfCollaborators = (wrapper) => {
    const collaborators = wrapper.find('[data-testid="collaborator"]');

    expect(collaborators.at(0).props().primary).toEqual('Kurt Cobain');
    expect(collaborators.at(0).props().secondary).toEqual('Manage');

    expect(collaborators.at(1).props().primary).toEqual('Mariah Carey');
    expect(collaborators.at(1).props().secondary).toEqual('Manage');

    expect(collaborators.at(2).props().primary).toEqual('Michael Jackson');
    expect(collaborators.at(2).props().secondary).toEqual('Write');

    expect(collaborators.at(3).props().primary).toEqual('Bruno Mars');
    expect(collaborators.at(3).props().secondary).toEqual('Read');
};

describe('PermissionsViewer', () => {
    const mockCollaborators = [
        {
            user: 'http://localhost/iri/user2-id',
            access: 'Write',
            name: 'Michael Jackson'
        },
        {
            user: 'http://localhost/iri/user3-id',
            access: 'Read',
            name: 'Bruno Mars'
        },
        {
            user: 'http://localhost/iri/user1-id',
            access: 'Manage',
            name: 'Mariah Carey'
        },
        {
            user: 'http://localhost/iri/user4-id',
            access: 'Manage',
            name: 'Kurt Cobain'
        }
    ];
    const mockcurrentUserCreatorCanManage = {id: 'user4-id'};
    const mockcurrentUserNotCreatorCanManage = {id: 'user1-id'};
    const mockcurrentUserNotCreatorCannotManage = {id: 'user3-id'};
    const mockCreator = 'user4-id';
    const mockFetchPermissionsFn = jest.fn();
    const mockAlterPermissionFn = jest.fn();

    describe('Use Case 1: Current user is creator and can manage collection', () => {
        let wrapper;
        beforeAll(() => {
            wrapper = shallow(
                <PermissionsViewer
                    creator={mockCreator}
                    iri={500}
                    currentUser={mockcurrentUserCreatorCanManage}
                    canManage
                    permissions={mockCollaborators}
                    alterPermission={mockAlterPermissionFn}
                    fetchPermissionsIfNeeded={mockFetchPermissionsFn}
                />
            );
        });

        it('should render all collaborators', () => {
            testRenderingCollaborators(wrapper);
        });

        it('should order permissions by the access rank (Manage-Write-Read)', () => {
            testOrderingOfCollaborators(wrapper);
        });

        // user can see all 4 permissions (one is disabled not hidden)
        it('should enable current user to alter all collaborator\'s permissions', () => {
            expect(wrapper.find(IconButton).length).toEqual(4);
        });

        it('should render add button', () => {
            expect(wrapper.find(Button).length).toEqual(1);
        });
    });

    describe('Use Case 2: Current user is NOT creator and can NOT manage collection', () => {
        let wrapper;
        beforeAll(() => {
            wrapper = shallow(
                <PermissionsViewer
                    creator={mockCreator}
                    iri={500}
                    canManage={false}
                    currentUser={mockcurrentUserNotCreatorCannotManage}
                    permissions={mockCollaborators}
                    alterPermission={mockAlterPermissionFn}
                    fetchPermissionsIfNeeded={mockFetchPermissionsFn}
                />
            );
        });

        it('should render all collaborators', () => {
            testRenderingCollaborators(wrapper);
        });

        it('should order permissions by the access rank (Manage-Write-Read)', () => {
            testOrderingOfCollaborators(wrapper);
        });

        it('should NOT enable current user to alter all collaborator\'s permissions', () => {
            expect(wrapper.find('MoreActions').length).toEqual(0);
        });

        it('should NOT render add button', () => {
            expect(wrapper.find('[aria-label="Add"]').length).toEqual(0);
        });
    });

    describe('Use Case 3: Current user is NOT creator and can manage collection', () => {
        let wrapper;
        beforeAll(() => {
            wrapper = shallow(
                <PermissionsViewer
                    creator={mockCreator}
                    iri={500}
                    canManage
                    currentUser={mockcurrentUserNotCreatorCanManage}
                    permissions={mockCollaborators}
                    alterPermission={mockAlterPermissionFn}
                    fetchPermissionsIfNeeded={mockFetchPermissionsFn}
                />
            );
        });

        it('should render all collaborators', () => {
            testRenderingCollaborators(wrapper);
        });

        it('should order permissions by the access rank (Manage-Write-Read)', () => {
            testOrderingOfCollaborators(wrapper);
        });

        it('should NOT enable current user to alter all collaborator\'s permissions', () => {
            expect(wrapper.find(IconButton).some('[disabled]')).toBeTruthy();
        });

        it('should render add button', () => {
            expect(wrapper.find(Button).length).toEqual(1);
        });
    });
});
