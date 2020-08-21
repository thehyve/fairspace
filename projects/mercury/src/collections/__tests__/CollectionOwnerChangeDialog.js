import React from 'react';
import {createMount, createShallow} from '@material-ui/core/test-utils';
import {Button} from '@material-ui/core';
import CollectionOwnerChangeDialog from "../CollectionOwnerChangeDialog";

describe('CollectionOwnerChangeDialog', () => {
    let shallow;
    let mount;

    const mockSetOwnedByFn = jest.fn();

    const mockCollection = {
        iri: 'http://localhost/iri/c1',
        location: 'c1',
        ownerWorkspace: 'http://localhost/iri/w1'
    };

    const mockWorkspaces = [
        {label: "w1", iri: 'http://localhost/iri/w1'},
        {label: "w2", iri: 'http://localhost/iri/w2'},
        {label: "w3", iri: 'http://localhost/iri/w3'}
    ];

    let wrapper;

    beforeAll(() => {
        shallow = createShallow({dive: true});
        mount = createMount();
    });

    afterAll(() => {
        mount.cleanUp();
    });

    it('should render initial state of the dialog correctly', () => {
        wrapper = shallow(<CollectionOwnerChangeDialog
            collection={mockCollection}
            workspaces={mockWorkspaces}
            setOwnedBy={mockSetOwnedByFn}
            onClose={() => {}}
        />);

        // initial state if it's open or not
        expect(wrapper.find('[data-testid="owner-workspace-change-dialog"]').prop('label')).not.toBeDefined();

        // render available values
        expect(wrapper.find('[data-testid="owner-workspace-change-dropdown"]').prop('options').length).toEqual(3);

        // render cancel and submit buttons
        expect(wrapper.find(Button).at(0).childAt(0).text()).toEqual('Save');
        expect(wrapper.find(Button).at(1).childAt(0).text()).toEqual('Cancel');
        expect(wrapper.find(Button).at(0).prop('disabled')).toBeTruthy();
    });
});
