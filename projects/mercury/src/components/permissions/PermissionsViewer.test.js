import React from 'react';
import {createShallow} from '@material-ui/core/test-utils';
import {PermissionsViewer, styles} from "./PermissionsViewer";

describe('PermissionsViewer', () => {
    const mockCollaborators = [
        {
            collectionId: 500,
            subject: 'user2-id',
            access: 'Write',
            firstName: 'Michael',
            lastName: 'Jackson'
        },
        {
            collectionId: 500,
            subject: 'user3-id',
            access: 'Read',
            firstName: 'Bruno',
            lastName: 'Mars'
        },
        {
            collectionId: 500,
            subject: 'user1-id',
            access: 'Manage',
            firstName: 'Mariah',
            lastName: 'Carey'
        },
        {
            collectionId: 500,
            subject: 'user4-id',
            access: 'Manage',
            firstName: 'Kurt',
            lastName: 'Cobain'
        }
    ];
    const mockcurrentUserCreatorCanManage = {id: 'user4-id'};
    const mockcurrentUserNotCreatorCanManage = {id: 'user1-id'};
    const mockcurrentUserNotCreatorCannotManage = {id: 'user3-id'};
    const mockUsers = [
        {id: 'user1-id', firstName: 'Mariah', lastName: 'Carey'},
        {id: 'user2-id', firstName: 'Michael', lastName: 'Jackson'},
        {id: 'user3-id', firstName: 'Bruno', lastName: 'Mars'},
        {id: 'user4-id', firstName: 'Kurt', lastName: 'Cobain'},
        {id: 'user5-id', firstName: 'Ariana', lastName: 'Grande'},
    ];
    const mockCreator = 'user4-id';
    const mockFetchPermissionsFn = jest.fn();
    const mockAlterPermissionFn = jest.fn();

    let shallow;

    beforeAll(() => {
        shallow = createShallow();
    });

    /**
     * Use case 1 :
     * - current user is the creator of the collection
     * - current user can manage the collection
     */
    describe('Use Case 1: Current user is creator and can manage collection', () => {
        let wrapper;
        beforeAll(() => {
            wrapper = shallow(<PermissionsViewer
                creator={mockCreator}
                collectionId={500}
                canManage

                classes={styles}
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
                primary: 'Mariah Carey',
                secondary: 'Manage'
            });
            expect(wrapper.find('WithStyles(ListItemText)').at(1).props('primary')).toEqual({
                primary: 'Kurt Cobain',
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

        it('should render add button', () => {
            expect(wrapper.find('[aria-label="Add"]').length).toEqual(1);
        });
    });

    /**
     * Use case 2 :
     * - current user is NOT the creator of the collection
     * - current user can NOT manage the collection
     */
    describe('Use Case 2: Current user is NOT creator and can NOT manage collection', () => {
        let wrapper;
        beforeAll(() => {
            wrapper = shallow(<PermissionsViewer
                creator={mockCreator}
                collectionId={500}
                canManage={false}

                classes={styles}
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

        it('should order permissions by the access rank (Manage-Write-Read)', () => {
            expect(wrapper.find('WithStyles(ListItemText)').at(0).props('primary')).toEqual({
                primary: 'Mariah Carey',
                secondary: 'Manage'
            });
            expect(wrapper.find('WithStyles(ListItemText)').at(1).props('primary')).toEqual({
                primary: 'Kurt Cobain',
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

    /**
     * Use case 3 :
     * - current user is NOT the creator of the collection
     * - current user can manage the collection
     */
    describe('Use Case 3: Current user is NOT creator and can manage collection', () => {
        let wrapper;
        beforeAll(() => {
            wrapper = shallow(<PermissionsViewer
                creator={mockCreator}
                collectionId={500}
                canManage

                classes={styles}
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

        it('should order permissions by the access rank (Manage-Write-Read)', () => {
            expect(wrapper.find('WithStyles(ListItemText)').at(0).props('primary')).toEqual({
                primary: 'Mariah Carey',
                secondary: 'Manage'
            });
            expect(wrapper.find('WithStyles(ListItemText)').at(1).props('primary')).toEqual({
                primary: 'Kurt Cobain',
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

        it('should render add button', () => {
            expect(wrapper.find('[aria-label="Add"]').length).toEqual(1);
        });
    });
});
