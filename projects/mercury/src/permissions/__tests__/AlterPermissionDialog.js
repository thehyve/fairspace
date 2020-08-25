import React from 'react';
import {createMount, createShallow} from '@material-ui/core/test-utils';
import {Button} from '@material-ui/core';

import {AlterPermissionDialog} from "../AlterPermissionDialog";
import PermissionCandidateSelect from "../PermissionCandidateSelect";
import Dropdown from "../../metadata/common/values/Dropdown";
import {accessLevels} from "../../collections/CollectionAPI";

describe('AlterPermissionDialog', () => {
    let shallow;
    let mount;

    const mockSetPermissionFn = jest.fn();
    const mockUsers = [
        {name: 'Mariah Carey', iri: 'http://localhost/iri/user1-id'},
        {name: 'Michael Jackson', iri: 'http://localhost/iri/user2-id'},
        {name: 'Bruno Mars', iri: 'http://localhost/iri/user3-id'},
        {name: 'Kurt Cobain', iri: 'http://localhost/iri/user4-id'},
        {name: 'Ariana Grande', iri: 'http://localhost/iri/user5-id'},
    ];
    const mockCollaborators = [
        {
            iri: 'http://localhost/iri/user2-id',
            access: 'Write'
        },
        {
            iri: 'http://localhost/iri/user4-id',
            access: 'Manage'
        }
    ];

    const mockCurrentLoggedUser = {
        id: 'user1-id',
        iri: 'http://localhost/iri/user1-id'
    };
    const mockCollection = {
        iri: 'http://localhost/iri/c1',
        location: 'c1'
    };
    const mockPrincipal = {
        iri: 'http://localhost/iri/user2-id',
        access: 'Write',
        name: 'Michael Jackson'
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
            accessLevels={accessLevels}
            collection={mockCollection}
            permissions={mockCollaborators}
            currentUser={mockCurrentLoggedUser}
            setPermission={mockSetPermissionFn}
            permissionCandidates={mockUsers}
            title="Select access level for a collaborator"
        />);

        // initial state if it's open or not
        expect(wrapper.find('[data-testid="permissions-dialog"]').prop('open')).toBeFalsy();

        // title =Share with
        expect(wrapper.find('#scroll-dialog-title').childAt(0).text()).toEqual('Select access level for a collaborator');

        // render collaborator selector
        expect(wrapper.find(PermissionCandidateSelect).prop('value')).toBe(null);

        // initial value of the access level is "null"
        expect(wrapper.find(Dropdown).prop('label')).toBe("Select access level");

        // render cancel and submit buttons
        expect(wrapper.find(Button).at(0).childAt(0).text()).toEqual('Save');
        expect(wrapper.find(Button).at(1).childAt(0).text()).toEqual('Cancel');
        expect(wrapper.find(Button).at(0).prop('disabled')).toBeTruthy();
    });

    it('should not render user selector and render selected user name instead when user is provided', () => {
        wrapper = mount(
            <AlterPermissionDialog
                open
                classes={{}}
                principal={mockPrincipal}
                access={mockPrincipal.access}
                accessLevels={accessLevels}
                collection={mockCollection}
                currentUser={mockCurrentLoggedUser}
                setPermission={mockSetPermissionFn}
                title="Select access level for a collaborator"
            />
        );

        wrapper.setState({selectedUser: mockPrincipal.iri});

        expect(wrapper.find(PermissionCandidateSelect)).toHaveLength(0);
        expect(wrapper.find('[data-testid="principal"]').at(0).text()).toEqual('Michael Jackson');
        expect(wrapper.find('[data-testid="submit"]').at(0).prop('disabled')).toBeFalsy(); // submit button enabled
    });
});
