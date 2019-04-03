import React from 'react';
import {shallow} from "enzyme";

import {IconButton} from "@material-ui/core";
import PermissionsViewer from "./PermissionsViewer";

describe('PermissionsViewer', () => {
    const mockCollaborators = [
        {
            user: 'http://localhost/iri/user2-id',
            access: 'Write',
            firstName: 'Michael',
            lastName: 'Jackson'
        },
        {
            user: 'http://localhost/iri/user3-id',
            access: 'Read',
            firstName: 'Bruno',
            lastName: 'Mars'
        },
        {
            user: 'http://localhost/iri/user1-id',
            access: 'Manage',
            firstName: 'Mariah',
            lastName: 'Carey'
        },
        {
            user: 'http://localhost/iri/user4-id',
            access: 'Manage',
            firstName: 'Kurt',
            lastName: 'Cobain'
        }
    ];
    const mockcurrentUserCreatorCanManage = {id: 'user4-id'};
    const mockcurrentUserNotCreatorCanManage = {id: 'user1-id'};
    const mockcurrentUserNotCreatorCannotManage = {id: 'user3-id'};
    const mockUsers = [
        {id: 'user1-id', firstName: 'Mariah', lastName: 'Carey', iri: 'http://localhost/iri/user1-id'},
        {id: 'user2-id', firstName: 'Michael', lastName: 'Jackson', iri: 'http://localhost/iri/user2-id'},
        {id: 'user3-id', firstName: 'Bruno', lastName: 'Mars', iri: 'http://localhost/iri/user3-id'},
        {id: 'user4-id', firstName: 'Kurt', lastName: 'Cobain', iri: 'http://localhost/iri/user4-id'},
        {id: 'user5-id', firstName: 'Ariana', lastName: 'Grande', iri: 'http://localhost/iri/user5-id'},
    ];
    const mockCreator = 'user4-id';
    const mockFetchPermissionsFn = jest.fn();
    const mockAlterPermissionFn = jest.fn();

    describe('Use Case 1: Current user is creator and can manage collection', () => {
        let wrapper;
        beforeAll(() => {
            wrapper = shallow(<PermissionsViewer
                creator={mockCreator}
                iri={500}
                canManage
                permissions={mockCollaborators}
                users={mockUsers}
                currentUser={mockcurrentUserCreatorCanManage}
                alterPermission={mockAlterPermissionFn}
                fetchPermissionsIfNeeded={mockFetchPermissionsFn}
            />);
        });
        it('should render all collaborators', () => {
            expect(wrapper.find('WithStyles(ListItemText)').length).toBe(4);
        });
        it('should order permissions by the access rank (Manage-Write-Read)', () => {
            expect(wrapper.find('WithStyles(ListItemText)').at(0).props('primary')).toEqual({
                primary: 'Kurt Cobain',
                secondary: 'Manage'
            });
            expect(wrapper.find('WithStyles(ListItemText)').at(1).props('primary')).toEqual({
                primary: 'Mariah Carey',
                secondary: 'Manage'
            });
            expect(wrapper.find('WithStyles(ListItemText)').at(2).props('primary')).toEqual({
                primary: 'Michael Jackson',
                secondary: 'Write'
            });
            expect(wrapper.find('WithStyles(ListItemText)').at(3).props('primary')).toEqual({
                primary: 'Bruno Mars',
                secondary: 'Read'
            });
        });

        // user can see all 4 permissions (one is disabled not hidden)
        it('should enable current user to alter all collaborator\'s permissions', () => {
            expect(wrapper.find(IconButton).length).toEqual(4);
        });


        it('should render add button', () => {
            expect(wrapper.find('[aria-label="Add"]').length).toEqual(1);
        });
    });

    describe('Use Case 2: Current user is NOT creator and can NOT manage collection', () => {
        let wrapper;
        beforeAll(() => {
            wrapper = shallow(<PermissionsViewer
                creator={mockCreator}
                iri={500}
                canManage={false}
                permissions={mockCollaborators}
                users={mockUsers}
                currentUser={mockcurrentUserNotCreatorCannotManage}
                alterPermission={mockAlterPermissionFn}
                fetchPermissionsIfNeeded={mockFetchPermissionsFn}
            />);
        });

        it('should render all collaborators', () => {
            expect(wrapper.find('WithStyles(ListItemText)').length).toBe(4);
        });

        it('should order permissions by the access rank (Manage-Write-Read) and name', () => {
            expect(wrapper.find('WithStyles(ListItemText)').at(0).props('primary')).toEqual({
                primary: 'Kurt Cobain',
                secondary: 'Manage'
            });
            expect(wrapper.find('WithStyles(ListItemText)').at(1).props('primary')).toEqual({
                primary: 'Mariah Carey',
                secondary: 'Manage'
            });
            expect(wrapper.find('WithStyles(ListItemText)').at(2).props('primary')).toEqual({
                primary: 'Michael Jackson',
                secondary: 'Write'
            });
            expect(wrapper.find('WithStyles(ListItemText)').at(3).props('primary')).toEqual({
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
        let wrapper;
        beforeAll(() => {
            wrapper = shallow(<PermissionsViewer
                creator={mockCreator}
                iri={500}
                canManage
                permissions={mockCollaborators}
                users={mockUsers}
                currentUser={mockcurrentUserNotCreatorCanManage}
                alterPermission={mockAlterPermissionFn}
                fetchPermissionsIfNeeded={mockFetchPermissionsFn}
            />);
        });

        it('should render all collaborators', () => {
            expect(wrapper.find('WithStyles(ListItemText)').length).toBe(4);
        });

        it('should order permissions by the access rank (Manage-Write-Read) and name', () => {
            expect(wrapper.find('WithStyles(ListItemText)').at(0).props('primary')).toEqual({
                primary: 'Kurt Cobain',
                secondary: 'Manage'
            });
            expect(wrapper.find('WithStyles(ListItemText)').at(1).props('primary')).toEqual({
                primary: 'Mariah Carey',
                secondary: 'Manage'
            });
            expect(wrapper.find('WithStyles(ListItemText)').at(2).props('primary')).toEqual({
                primary: 'Michael Jackson',
                secondary: 'Write'
            });
            expect(wrapper.find('WithStyles(ListItemText)').at(3).props('primary')).toEqual({
                primary: 'Bruno Mars',
                secondary: 'Read'
            });
        });
        it('should NOT enable current user to alter all collaborator\'s permissions', () => {
            expect(wrapper.find(IconButton).some('[disabled]')).toBeTruthy();
        });
        it('should render add button', () => {
            expect(wrapper.find('[aria-label="Add"]').length).toEqual(1);
        });
    });
});
