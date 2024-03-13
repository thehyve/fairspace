import React from 'react';
import {fireEvent, render} from '@testing-library/react';
import {act} from 'react-dom/test-utils';
import '@testing-library/jest-dom/extend-expect';
import {MemoryRouter} from 'react-router-dom';

import NewLinkedDataEntityDialog from '../NewLinkedDataEntityDialog';
import LinkedDataContext from '../../LinkedDataContext';
import VocabularyContext from '../../vocabulary/VocabularyContext';

const shape = {
    '@type': ['https://fairspace.nl/ontology#ClassShape'],
    '@id': 'http://xmlns.com/foaf/0.1/SomeClass',
    'http://www.w3.org/ns/shacl#targetClass': [
        {
            '@id': 'http://xmlns.com/foaf/0.1/SomeClass'
        }
    ]
};

const extendProperties = () => [];

describe('<NewLinkedDataEntityDialog />', () => {
    const createLinkedDataEntity = jest.fn();
    beforeEach(() => {
        createLinkedDataEntity.mockResolvedValue({});
    });

    it('initialises the values/updates with the type', async () => {
        const {getByTestId} = render(
            <MemoryRouter>
                <VocabularyContext.Provider
                    value={{
                        vocabulary: []
                    }}
                >
                    <LinkedDataContext.Provider
                        value={{
                            shapes: [],
                            extendProperties,
                            createLinkedDataEntity
                        }}
                    >
                        <NewLinkedDataEntityDialog
                            shape={shape}
                            requireIdentifier={false}
                            onCreate={() => {}}
                            onClose={() => {}}
                        />
                    </LinkedDataContext.Provider>
                </VocabularyContext.Provider>
            </MemoryRouter>
        );

        const submitButton = getByTestId('submit-button');

        await act(async () => {
            fireEvent.click(submitButton);
        });

        expect(createLinkedDataEntity).toHaveBeenCalledTimes(1);
        expect(createLinkedDataEntity).toHaveBeenCalledWith(
            undefined,
            {},
            'http://xmlns.com/foaf/0.1/SomeClass'
        );
    });
});
