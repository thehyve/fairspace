import React from 'react';
import {render, fireEvent} from '@testing-library/react';
import {act} from 'react-dom/test-utils';
import '@testing-library/jest-dom/extend-expect';
import {Provider} from "react-redux";
import configureStore from 'redux-mock-store';
import {MemoryRouter} from "react-router-dom";

import NewLinkedDataEntityDialog from "../NewLinkedDataEntityDialog";
import '../__mocks__/crypto.mock';
import LinkedDataContext from '../../LinkedDataContext';

const mockStore = configureStore();

const store = mockStore({
    cache: {
        filesByPath: []
    },
    clipboard: {
        fileNames: []
    },
    collectionBrowser: {
        selectedPaths: []
    },
    uploads: []
});

const shape = {
    "@type": [
        "http://fairspace.io/ontology#ClassShape"
    ],
    "@id": "http://xmlns.com/foaf/0.1/SomeClass",
    "http://www.w3.org/ns/shacl#targetClass": [
        {
            "@id": "http://xmlns.com/foaf/0.1/SomeClass"
        }
    ]
};

const shapes = {
    getPropertiesForNodeShape: () => []
};

const extendProperties = () => [];

const createLinkedDataEntity = jest.fn(() => Promise.resolve());

describe('<NewLinkedDataEntityDialog />', () => {
    it('initilises the values/updates with the type', async () => {
        const {getByTestId} = render(
            <Provider store={store}>
                <MemoryRouter>
                    <LinkedDataContext.Provider
                        value={{
                            shapes,
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
                </MemoryRouter>
            </Provider>
        );

        const submitButton = getByTestId('submit-button');

        await act(async () => {
            fireEvent.click(submitButton);
        });

        expect(createLinkedDataEntity).toHaveBeenCalledTimes(1);
        expect(createLinkedDataEntity).toHaveBeenCalledWith(undefined, {}, 'http://xmlns.com/foaf/0.1/SomeClass');
    });
});
