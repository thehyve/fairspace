import React from 'react';
import {createShallow} from '@material-ui/core/test-utils';
import {PermissionsViewer, styles} from "./PermissionsViewer";

describe('PermissionViewer', () => {

    const mockCollaborators = {
        data: [
            {
                'collectionId': 500,
                'subject': 'user2-id',
                'access': 'Write'
            },
            {
                'collectionId': 500,
                'subject': 'user3-id',
                'access': 'Read'
            },
            {
                'collectionId': 500,
                'subject': 'user1-id',
                'access': 'Manage'
            },
            {
                'collectionId': 500,
                'subject': 'user4-id',
                'access': 'Manage'
            }
        ]
    };
    const mockCurrentLoggedUserCreatorCanManage = {id: 'user4-id'};
    const mockCurrentLoggedUserNotCreatorCanManage = {id: 'user1-id'};
    const mockCurrentLoggedUserNotCreatorCannotManage = {id: 'user3-id'};

    const mockCreator = 'user4-id';
    const mockFecthPermissionsFn = jest.fn();
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
                canManage={true}

                classes={styles}
                permissions={mockCollaborators}
                currentLoggedUser={mockCurrentLoggedUserCreatorCanManage}
                alterPermission={mockAlterPermissionFn}
                fetchPermissions={mockFecthPermissionsFn}
            />);
        });

        it('should render all collaborators', () => {
            expect(wrapper.find('WithStyles(ListItemText)').length).toBe(4);
        });

        it('should order permissions by the access rank (Manage-Write-Read)', () => {
            expect(wrapper.find('WithStyles(ListItemText)').at(0).props('primary')).toEqual({
                primary: 'user1-id',
                secondary: 'Manage'
            });
            expect(wrapper.find('WithStyles(ListItemText)').at(1).props('primary')).toEqual({
                primary: 'user4-id',
                secondary: 'Manage'
            });
            expect(wrapper.find('WithStyles(ListItemText)').at(2).props('primary')).toEqual({
                primary: 'user2-id',
                secondary: 'Write'
            });
            expect(wrapper.find('WithStyles(ListItemText)').at(3).props('primary')).toEqual({
                primary: 'user3-id',
                secondary: 'Read'
            });
        });

        it('should enable current user to alter all collaborator\'s permissions', () => {
            expect(wrapper.find('[aria-label="Alter Permission"]').length).toEqual(3)
        });
        it('should render add button', () => {
            expect(wrapper.find('[aria-label="Add"]').length).toEqual(1)
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
                currentLoggedUser={mockCurrentLoggedUserNotCreatorCannotManage}
                alterPermission={mockAlterPermissionFn}
                fetchPermissions={mockFecthPermissionsFn}
            />);
        });

        it('should render all collaborators', () => {
            expect(wrapper.find('WithStyles(ListItemText)').length).toBe(4);
        });

        it('should order permissions by the access rank (Manage-Write-Read)', () => {
            expect(wrapper.find('WithStyles(ListItemText)').at(0).props('primary')).toEqual({
                primary: 'user1-id',
                secondary: 'Manage'
            });
            expect(wrapper.find('WithStyles(ListItemText)').at(1).props('primary')).toEqual({
                primary: 'user4-id',
                secondary: 'Manage'
            });
            expect(wrapper.find('WithStyles(ListItemText)').at(2).props('primary')).toEqual({
                primary: 'user2-id',
                secondary: 'Write'
            });
            expect(wrapper.find('WithStyles(ListItemText)').at(3).props('primary')).toEqual({
                primary: 'user3-id',
                secondary: 'Read'
            });
        });

        it('should NOT enable current user to alter all collaborator\'s permissions', () => {
            expect(wrapper.find('[aria-label="Alter Permission"]').length).toEqual(0)
        });

        it('should NOT render add button', () => {
            expect(wrapper.find('[aria-label="Add"]').length).toEqual(0)
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
                canManage={true}

                classes={styles}
                permissions={mockCollaborators}
                currentLoggedUser={mockCurrentLoggedUserNotCreatorCanManage}
                alterPermission={mockAlterPermissionFn}
                fetchPermissions={mockFecthPermissionsFn}
            />);
            // debug
            console.log(wrapper.debug());
        });

        it('should render all collaborators', () => {
            expect(wrapper.find('WithStyles(ListItemText)').length).toBe(4);
        });

        it('should order permissions by the access rank (Manage-Write-Read)', () => {
            expect(wrapper.find('WithStyles(ListItemText)').at(0).props('primary')).toEqual({
                primary: 'user1-id',
                secondary: 'Manage'
            });
            expect(wrapper.find('WithStyles(ListItemText)').at(1).props('primary')).toEqual({
                primary: 'user4-id',
                secondary: 'Manage'
            });
            expect(wrapper.find('WithStyles(ListItemText)').at(2).props('primary')).toEqual({
                primary: 'user2-id',
                secondary: 'Write'
            });
            expect(wrapper.find('WithStyles(ListItemText)').at(3).props('primary')).toEqual({
                primary: 'user3-id',
                secondary: 'Read'
            });
        });

        it('should NOT enable current user to alter all collaborator\'s permissions', () => {
            expect(wrapper.find('[aria-label="Alter Permission"]').length).toEqual(3)
        });

        it('should render add button', () => {
            expect(wrapper.find('[aria-label="Add"]').length).toEqual(1)
        });
    });

});
