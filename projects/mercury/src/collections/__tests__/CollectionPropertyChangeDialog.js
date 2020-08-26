import React from 'react';
import {createMount, createShallow} from '@material-ui/core/test-utils';
import {Button} from '@material-ui/core';
import CollectionPropertyChangeDialog from "../CollectionStatusChangeDialog";
import {statuses} from "../CollectionAPI";

describe('CollectionPropertyChangeDialog', () => {
    let shallow;
    let mount;

    const mockSetValueFn = jest.fn();

    const mockCollection = {
        iri: 'http://localhost/iri/c1',
        location: 'c1',
        availableStatuses: statuses
    };

    const mockAvailableValues = ["x", "y", "z"];

    let wrapper;

    beforeAll(() => {
        shallow = createShallow({dive: true});
        mount = createMount();
    });

    afterAll(() => {
        mount.cleanUp();
    });

    it('should render initial state of the dialog correctly', () => {
        wrapper = shallow(<CollectionPropertyChangeDialog
            collection={mockCollection}
            title="Select collection property value"
            value="Active"
            availableValues={mockAvailableValues}
            setValue={mockSetValueFn}
            onClose={() => {}}
        />);

        // initial state if it's open or not
        expect(wrapper.find('[data-testid="property-change-dialog"]').prop('openDialog')).toBeFalsy();

        // title
        expect(wrapper.find('#property-change-dialog-title').childAt(0).text()).toEqual("Select collection status");

        // render available values
        expect(wrapper.find('[aria-label="Available values"]').prop('value')).toEqual('Active');
        expect(wrapper.find('[aria-label="Available values"]').childAt(0).prop('value')).toEqual(mockAvailableValues[0]);
        expect(wrapper.find('[aria-label="Available values"]').childAt(1).prop('value')).toEqual(mockAvailableValues[1]);
        expect(wrapper.find('[aria-label="Available values"]').childAt(2).prop('value')).toEqual(mockAvailableValues[2]);

        // render cancel and submit buttons
        expect(wrapper.find(Button).at(0).childAt(0).text()).toEqual('Save');
        expect(wrapper.find(Button).at(1).childAt(0).text()).toEqual('Cancel');
        expect(wrapper.find(Button).at(0).prop('disabled')).toBeFalsy();
    });
});
