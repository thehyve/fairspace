import React from 'react';
import '@testing-library/jest-dom/extend-expect';
import {render} from '@testing-library/react';

import CollectionList from "../CollectionList";

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
            iri: 'http://example.com/0'
        }];

        const {getByText} = render(<CollectionList collections={collections} />);

        expect(getByText('Name')).toBeInTheDocument();
        expect(getByText('Creator')).toBeInTheDocument();
        expect(getByText('Created')).toBeInTheDocument();
        expect(getByText('My Collection')).toBeInTheDocument();
        expect(getByText('Mariah Carey')).toBeInTheDocument();
    });
});
