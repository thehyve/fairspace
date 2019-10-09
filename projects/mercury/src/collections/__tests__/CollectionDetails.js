import React from 'react';
import {render} from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

import CollectionDetails, {ICONS} from "../CollectionDetails";

describe('<CollectionDetails />', () => {
    it('renders proper icon for local storage collection', () => {
        const dateCreated = new Date().toUTCString();
        const collection = {type: 'LOCAL_STORAGE', name: 'Test1', iri: 'http://test', dateCreated};
        const {getByText} = render(<CollectionDetails collection={collection} />);

        expect(getByText(ICONS.LOCAL_STORAGE)).toBeInTheDocument();
    });
});
