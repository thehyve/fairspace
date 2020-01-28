import React from 'react';
import {render} from '@testing-library/react';
import {act} from 'react-dom/test-utils';
import '@testing-library/jest-dom/extend-expect';

import {CollectionDetails, ICONS} from "../CollectionDetails";

describe('<CollectionDetails />', () => {
    it('renders proper icon for local storage collection', async () => {
        const dateCreated = new Date().toUTCString();
        const collection = {type: 'LOCAL_STORAGE', name: 'Test1', iri: 'http://test', dateCreated};

        await act(async () => {
            const {getByText} = render(<CollectionDetails collection={collection} />);

            expect(getByText(ICONS.LOCAL_STORAGE)).toBeInTheDocument();
        });
    });
});
