import React from 'react';
import {render, screen} from '@testing-library/react';
import CollectionOwnerChangeDialog from '../CollectionOwnerChangeDialog';

describe('CollectionOwnerChangeDialog', () => {
    const mockSetOwnedByFn = jest.fn();

    const mockCollection = {
        iri: 'http://localhost/iri/c1',
        name: 'c1',
        ownerWorkspace: 'http://localhost/iri/w1',
    };

    const mockWorkspaces = [
        {label: 'w1', iri: 'http://localhost/iri/w1'},
        {label: 'w2', iri: 'http://localhost/iri/w2'},
        {label: 'w3', iri: 'http://localhost/iri/w3'}
    ];

    it('should render initial state of the dialog correctly', () => {
        render(<CollectionOwnerChangeDialog
            collection={mockCollection}
            workspaces={mockWorkspaces}
            setOwnedBy={mockSetOwnedByFn}
            onClose={() => {}}
        />);

        // expect(screen.getByRole("table")).toBeInTheDocument();
        // render available values
        const buttons = screen.queryAllByRole('button');

        expect(buttons).toHaveLength(3);

        // render cancel and submit buttons
        expect(buttons[0].title).toEqual('Open');
        expect(buttons[1].textContent).toEqual('Save');
        expect(buttons[2].textContent).toEqual('Cancel');
        expect(buttons[0].disabled).toBeFalsy();
        expect(buttons[1].disabled).toBeTruthy();
        expect(buttons[2].disabled).toBeFalsy();
    });
});
