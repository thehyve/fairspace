import React from 'react';
import '@testing-library/jest-dom/extend-expect';
import {render} from '@testing-library/react';

import CollectionList from "../CollectionList";
import WorkspaceContext from "../../workspaces/WorkspaceContext";

describe('CollectionList', () => {
    it('shows warning message when no collections available', () => {
        const {getByText} = render(<CollectionList />);
        expect(getByText(/Please create a collection/i)).toBeInTheDocument();
    });

    it('renders correct header and values columns', () => {
        const collections = [{
            name: 'My Collection',
            creatorObj: {
                name: 'Mariah Carey'
            },
            dateCreated: new Date().toUTCString(),
            iri: 'http://example.com/0',
            ownerWorkspace: 'http://example.com/ws1'
        }];

        const {getByText} = render(
            <WorkspaceContext.Provider value={{workspaces: [{iri: 'http://example.com/ws1', name: 'ws1'}]}}>
                <CollectionList collections={collections} />
            </WorkspaceContext.Provider>
        );

        expect(getByText('Name')).toBeInTheDocument();
        expect(getByText('Creator')).toBeInTheDocument();
        expect(getByText('Created')).toBeInTheDocument();
        expect(getByText('My Collection')).toBeInTheDocument();
        expect(getByText('Mariah Carey')).toBeInTheDocument();
        expect(getByText('Workspace')).toBeInTheDocument();
        expect(getByText('ws1')).toBeInTheDocument();
    });
});
