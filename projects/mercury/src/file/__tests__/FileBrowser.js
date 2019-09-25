/* eslint-disable react/jsx-props-no-spreading */
import React from 'react';
import {render, cleanup, fireEvent, getByText} from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import {Provider} from "react-redux";
import configureStore from 'redux-mock-store';

import {FileBrowser} from '../FileBrowser';
import Config from "../../common/services/Config";
import configFile from "../../config";

afterEach(cleanup);

const mockStore = configureStore();

beforeAll(() => {
    Config.setConfig(Object.assign(configFile, {
        externalConfigurationFiles: [],
    }));

    return Config.init();
});

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

const initialProps = {
    match: {
        params: {
            collection: ''
        }
    },
    fetchFilesIfNeeded: () => {},
    history: {
        listen: () => {}
    }
};

const openedCollection = {
    iri: "http://localhost/iri/86a2f097-adf9-4733-a7b4-53da7a01d9f0",
    dateCreated: "2019-09-12T10:34:53.585Z",
    createdBy: "http://localhost/iri/6e6cde34-45bc-42d8-8cdb-b6e9faf890d3",
    dateModified: "2019-09-12T10:34:53.585Z",
    modifiedBy: "http://localhost/iri/6e6cde34-45bc-42d8-8cdb-b6e9faf890d3",
    dateDeleted: null,
    deletedBy: null,
    name: "asd",
    description: "",
    location: "asd",
    connectionString: "",
    access: "Manage",
    canRead: true,
    canWrite: true,
    canManage: true,
    creatorObj: {
        iri: "http://localhost/iri/6e6cde34-45bc-42d8-8cdb-b6e9faf890d3",
        name: "John Snow",
        email: "user@example.com"
    }
};

describe('FileBrowser', () => {
    it('renders proper view', () => {
        const {queryByTestId} = render(
            <Provider store={store}>
                <FileBrowser
                    openedCollection={openedCollection}
                    {...initialProps}
                    match={{
                        params: {
                            collection: openedCollection.location
                        }
                    }}
                />
            </Provider>
        );

        expect(queryByTestId('files-view')).toBeTruthy();
        expect(queryByTestId('upload-view')).toBeFalsy();

        const uploadTab = queryByTestId('upload-tab');
        fireEvent.click(uploadTab);

        expect(queryByTestId('files-view')).toBeFalsy();
        expect(queryByTestId('upload-view')).toBeTruthy();
    });

    it('show error when no open collection is provided', () => {
        const {container} = render(
            <Provider store={store}>
                <FileBrowser
                    {...initialProps}
                />
            </Provider>
        );

        // finds substring ignoring case
        expect(getByText(container, /collection does not exist/i)).toBeTruthy();
    });

    it('show no open collection error when no collection is provided even when another error is given', () => {
        const {container} = render(
            <Provider store={store}>
                <FileBrowser
                    {...initialProps}
                    error="some error"
                />
            </Provider>
        );

        expect(getByText(container, /collection does not exist/i)).toBeTruthy();
    });


    it('show error when when an error messsage is given', () => {
        const {container} = render(
            <Provider store={store}>
                <FileBrowser
                    {...initialProps}
                    openedCollection={openedCollection}
                    error="some error"
                />
            </Provider>
        );

        // finds substring ignoring case
        expect(getByText(container, /error occurred/i)).toBeTruthy();
    });

    it('cleans up listener after unmount', () => {
        const cleanupFn = jest.fn();

        const {unmount} = render(
            <Provider store={store}>
                <FileBrowser
                    {...initialProps}
                    history={{
                        listen: () => cleanupFn
                    }}
                />
            </Provider>
        );

        unmount();

        expect(cleanupFn).toHaveBeenCalledTimes(1);
    });
});
