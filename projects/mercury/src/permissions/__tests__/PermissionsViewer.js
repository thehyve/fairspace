import React from 'react';
import {shallow} from "enzyme";

import {IconButton, Button} from "@material-ui/core";
import PermissionsViewer from "../PermissionsViewer";

function getPermissionAt(wrapper, at) {
    return wrapper.find('WithStyles(ListItemText)').at(at).props('primary');
}

describe('PermissionsViewer', () => {
    const mockCollaborators = [
        {
            user: 'http://localhost/iri/user2-id',
            access: 'Write',
            firstName: 'Michael',
            lastName: 'Jackson',
            userName: 'Michael Jackson'
        },
        {
            user: 'http://localhost/iri/user3-id',
            access: 'Read',
            firstName: 'Bruno',
            lastName: 'Mars',
            userName: 'Bruno Mars'
        },
        {
            user: 'http://localhost/iri/user1-id',
            access: 'Manage',
            firstName: 'Mariah',
            lastName: 'Carey',
            userName: 'Mariah Carey'
        },
        {
            user: 'http://localhost/iri/user4-id',
            access: 'Manage',
            firstName: 'Kurt',
            lastName: 'Cobain',
            userName: 'Kurt Cobain'
        }
    ];
    const mockcurrentUserCreatorCanManage = {id: 'user4-id'};
    const mockcurrentUserNotCreatorCanManage = {id: 'user1-id'};
    const mockcurrentUserNotCreatorCannotManage = {id: 'user3-id'};
    const mockCreator = 'user4-id';

    describe('Use Case 1: Current user is creator and can manage collection', () => {
        const wrapper = shallow(
            <PermissionsViewer
                creator={mockCreator}
                iri={500}
                currentUser={mockcurrentUserCreatorCanManage}
                canManage
                permissions={mockCollaborators}
                alterPermission={() => {}}
                fetchPermissionsIfNeeded={() => {}}
            />
        );

        it('should render all collaborators', () => {
            expect(wrapper.find('WithStyles(ListItemText)').length).toBe(4);
        });

        it('should order permissions by the access rank (Manage-Write-Read)', () => {
            expect(getPermissionAt(wrapper, 0))
                .toEqual({
                    primary: 'Kurt Cobain',
                    secondary: 'Manage'
                });
            expect(getPermissionAt(wrapper, 1))
                .toEqual({
                    primary: 'Mariah Carey',
                    secondary: 'Manage'
                });
            expect(getPermissionAt(wrapper, 2))
                .toEqual({
                    primary: 'Michael Jackson',
                    secondary: 'Write'
                });
            expect(getPermissionAt(wrapper, 3))
                .toEqual({
                    primary: 'Bruno Mars',
                    secondary: 'Read'
                });
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
        const wrapper = shallow(
            <PermissionsViewer
                creator={mockCreator}
                iri={500}
                canManage={false}
                currentUser={mockcurrentUserNotCreatorCannotManage}
                permissions={mockCollaborators}
                alterPermission={() => {}}
                fetchPermissionsIfNeeded={() => {}}
            />
        );

        it('should render all collaborators', () => {
            expect(wrapper.find('WithStyles(ListItemText)').length).toBe(4);
        });

        it('should order permissions by the access rank (Manage-Write-Read) and name', () => {
            expect(getPermissionAt(wrapper, 0))
                .toEqual({
                    primary: 'Kurt Cobain',
                    secondary: 'Manage'
                });
            expect(getPermissionAt(wrapper, 1))
                .toEqual({
                    primary: 'Mariah Carey',
                    secondary: 'Manage'
                });
            expect(getPermissionAt(wrapper, 2))
                .toEqual({
                    primary: 'Michael Jackson',
                    secondary: 'Write'
                });
            expect(getPermissionAt(wrapper, 3))
                .toEqual({
                    primary: 'Bruno Mars',
                    secondary: 'Read'
                });
        });

        it('should NOT enable current user to alter all collaborator\'s permissions', () => {
            expect(wrapper.find('MoreActions').length).toEqual(0);
        });

        it('should NOT render add button', () => {
            expect(wrapper.find('[aria-label="Add"]').length).toEqual(0);
        });
    });

    describe('Use Case 3: Current user is NOT creator and can manage collection', () => {
        const wrapper = shallow(
            <PermissionsViewer
                creator={mockCreator}
                iri={500}
                canManage
                currentUser={mockcurrentUserNotCreatorCanManage}
                permissions={mockCollaborators}
                alterPermission={() => {}}
                fetchPermissionsIfNeeded={() => {}}
            />
        );

        it('should render all collaborators', () => {
            expect(wrapper.find('WithStyles(ListItemText)').length).toBe(4);
        });

        it('should order permissions by the access rank (Manage-Write-Read) and name', () => {
            expect(getPermissionAt(wrapper, 0))
                .toEqual({
                    primary: 'Kurt Cobain',
                    secondary: 'Manage'
                });
            expect(getPermissionAt(wrapper, 1))
                .toEqual({
                    primary: 'Mariah Carey',
                    secondary: 'Manage'
                });
            expect(getPermissionAt(wrapper, 2))
                .toEqual({
                    primary: 'Michael Jackson',
                    secondary: 'Write'
                });
            expect(getPermissionAt(wrapper, 3))
                .toEqual({
                    primary: 'Bruno Mars',
                    secondary: 'Read'
                });
        });

        it('should NOT enable current user to alter all collaborator\'s permissions', () => {
            expect(wrapper.find(IconButton).some('[disabled]')).toBeTruthy();
        });

        it('should render add button', () => {
            expect(wrapper.find(Button).length).toEqual(1);
        });
    });
});
