import React from 'react';
import {createMount, createShallow} from '@mui/material/test-utils';
import {Button} from '@mui/material';
import CollectionStatusChangeDialog from "../CollectionStatusChangeDialog";
import {statuses} from "../CollectionAPI";

describe('CollectionStatusChangeDialog', () => {
    let shallow;
    let mount;

    const mockSetValueFn = jest.fn();

    const mockCollection = {
        iri: 'http://localhost/iri/c1',
        name: 'c1',
        availableStatuses: statuses,
        status: 'Active'
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
        wrapper = shallow(<CollectionStatusChangeDialog
            collection={mockCollection}
            setValue={mockSetValueFn}
            onClose={() => {}}
            classes={{}}
        />);

        // initial state if it's open or not
        expect(wrapper.find('[data-testid="property-change-dialog"]').prop('openDialog')).toBeFalsy();

        // title
        expect(wrapper.find('#property-change-dialog-title').childAt(0).text()).toEqual("Change collection status");

        // render available values
        expect(wrapper.find('[aria-label="Available values"]').prop('value')).toEqual('Active');
        expect(wrapper.find('[aria-label="Available values"]').childAt(0).prop('value')).toEqual(statuses[0]);
        expect(wrapper.find('[aria-label="Available values"]').childAt(1).prop('value')).toEqual(statuses[1]);
        expect(wrapper.find('[aria-label="Available values"]').childAt(2).prop('value')).toEqual(statuses[2]);

        // render cancel and submit buttons
        expect(wrapper.find(Button).at(0).childAt(0).text()).toEqual('Save');
        expect(wrapper.find(Button).at(1).childAt(0).text()).toEqual('Cancel');
        expect(wrapper.find(Button).at(0).prop('disabled')).toBeFalsy();
    });
});
