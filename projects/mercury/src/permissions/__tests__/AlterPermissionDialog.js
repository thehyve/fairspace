import React from 'react';
import {createShallow, createMount} from '@material-ui/core/test-utils';
import {Button} from '@material-ui/core';

import {AlterPermissionDialog} from "../AlterPermissionDialog";
import UserSelect from "../UserSelect";

describe('AlterPermissionDialog', () => {
    let shallow;
    let mount;

    const mockAlterPermissionFn = jest.fn();
    const mockUsers = [

        {name: 'Mariah Carey', iri: 'http://localhost/iri/user1-id'},
        {name: 'Michael Jackson', iri: 'http://localhost/iri/user2-id'},
        {name: 'Bruno Mars', iri: 'http://localhost/iri/user3-id'},
        {name: 'Kurt Cobain', iri: 'http://localhost/iri/user4-id'},
        {name: 'Ariana Grande', iri: 'http://localhost/iri/user5-id'},
    ];
    const mockCollaborators = [
        {
            user: 'http://localhost/iri/user2-id',
            access: 'Write'
        },
        {
            user: 'http://localhost/iri/user4-id',
            access: 'Manage'
        }
    ];

    const mockCurrentLoggedUser = {
        id: 'user1-id',
        iri: 'http://localhost/iri/user1-id'
    };
    const mockCollectionId = 500;
    const mockPermission = {
        user: 'http://localhost/iri/user2-id',
        access: 'Write'
    };

    let wrapper;

    beforeAll(() => {
        shallow = createShallow({dive: true});
        mount = createMount();
    });

    afterAll(() => {
        mount.cleanUp();
    });

    it('should render initial state of the dialog correctly', () => {
        wrapper = shallow(<AlterPermissionDialog
            open={false}
            classes={{}}
            permission={null}
            collectionId={mockCollectionId}
            collaborators={mockCollaborators}
            currentUser={mockCurrentLoggedUser}
            alterPermission={mockAlterPermissionFn}
            users={mockUsers}
        />);

        // console.log(wrapper.debug());
        // initial state if it's open or not
        expect(wrapper.find('[data-testid="permissions-dialog"]').prop('open')).toBeFalsy();

        // title =Share with
        expect(wrapper.find('#scroll-dialog-title').childAt(0).text()).toEqual('Share with');

        // render collacborator selector
        expect(wrapper.find(UserSelect).prop('value')).toBe(null);

        // initial value of the access right is "Read"
        expect(wrapper.find('[aria-label="Access right"]').prop('value')).toEqual('Read');
        // populate radio group with 3 access options
        expect(wrapper.find('[aria-label="Access right"]').childAt(0).prop('value')).toEqual('Read');
        expect(wrapper.find('[aria-label="Access right"]').childAt(1).prop('value')).toEqual('Write');
        expect(wrapper.find('[aria-label="Access right"]').childAt(2).prop('value')).toEqual('Manage');

        // render cancel and submit buttons
        expect(wrapper.find(Button).at(0).childAt(0).text()).toEqual('Cancel');
        expect(wrapper.find(Button).at(1).childAt(0).text()).toEqual('Submit');
        expect(wrapper.find(Button).at(1).prop('disabled')).toBeTruthy();
    });

    it('should not render user selector and render selected user fullname instead when user is provided', () => {
        wrapper = mount(
            <AlterPermissionDialog
                open
                classes={{}}
                user={mockPermission.user}
                access={mockPermission.access}
                iri={mockPermission.iri}
                collectionId={mockCollectionId}
                collaborators={mockCollaborators}
                currentUser={mockCurrentLoggedUser}
                alterPermission={mockAlterPermissionFn}
                users={mockUsers}
            />
        );

        wrapper.setState({selectedUser: mockPermission.user});

        expect(wrapper.find(UserSelect)).toHaveLength(0);
        expect(wrapper.find('[data-testid="user"]').at(0).text()).toEqual('Michael Jackson');
        expect(wrapper.find('[data-testid="submit"]').at(0).prop('disabled')).toBeFalsy(); // submit button enabled
    });
});
