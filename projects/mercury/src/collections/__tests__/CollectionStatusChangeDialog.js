import React from 'react';
import {render, screen} from '@testing-library/react';
import CollectionStatusChangeDialog from '../CollectionStatusChangeDialog';
import {statuses} from '../CollectionAPI';

describe('CollectionStatusChangeDialog', () => {
    const mockSetValueFn = jest.fn();

    const mockCollection = {
        iri: 'http://localhost/iri/c1',
        name: 'c1',
        availableStatuses: statuses,
        status: 'Active'
    };

    it('should render initial state of the dialog correctly', () => {
        render(
            <CollectionStatusChangeDialog
                collection={mockCollection}
                setValue={mockSetValueFn}
                onClose={() => {}}
                classes={{}}
            />
        );

        // title
        expect(screen.getByText('Change collection status')).toBeInTheDocument();

        const radios = screen.getAllByRole('radio');
        // render available values
        expect(radios[0].value).toEqual(statuses[0]); // Active
        expect(radios[1].value).toEqual(statuses[1]);
        expect(radios[2].value).toEqual(statuses[2]);

        const buttons = screen.getAllByRole('button');
        expect(buttons[0].textContent).toEqual('Save');
        expect(buttons[1].textContent).toEqual('Cancel');
        expect(buttons[0].enabled).toBeFalsy();
    });
});
