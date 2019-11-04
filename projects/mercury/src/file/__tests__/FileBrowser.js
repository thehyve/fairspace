/* eslint-disable react/jsx-props-no-spreading */
import React from 'react';
import {cleanup, fireEvent, render} from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

import {DisconnectedFileBrowser} from '../FileBrowser';
import {UploadsProvider} from "../../common/contexts/UploadsContext";

afterEach(cleanup);

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

const fileActionsMock = {
    getDownloadLink: () => 'http://a',
    createDirectory: () => Promise.resolve(),
    renameFile: () => Promise.resolve(),
    deleteMultiple: () => Promise.resolve(),
    movePaths: () => new Promise(resolve => setTimeout(resolve, 500))
};

const selectionMock = {
    isSelected: () => false,
    selected: []
};

const initialProps = {
    openedPath: '/',
    history: {
        listen: () => {}
    },
    files: [{
        filename: 'a'
    }],
    selection: selectionMock
};

describe('FileBrowser', () => {
    const renderWithProviders = children => render(
        <UploadsProvider>
            {children}
        </UploadsProvider>
    );

    it('renders proper view', () => {
        const {queryByTestId} = renderWithProviders(
            <DisconnectedFileBrowser
                openedCollection={openedCollection}
                fileActions={fileActionsMock}
                {...initialProps}
            />
        );

        expect(queryByTestId('files-view')).toBeInTheDocument();
        expect(queryByTestId('upload-view')).not.toBeInTheDocument();

        const uploadTab = queryByTestId('upload-tab');
        fireEvent.click(uploadTab);

        expect(queryByTestId('files-view')).not.toBeInTheDocument();
        expect(queryByTestId('upload-view')).toBeInTheDocument();
    });

    it('show error when no open collection is provided', () => {
        const {getByText} = renderWithProviders(
            <DisconnectedFileBrowser
                {...initialProps}
            />
        );

        // finds substring ignoring case
        expect(getByText(/collection does not exist/i)).toBeInTheDocument();
    });

    it('show no open collection error when no collection is provided even when another error is given', () => {
        const {getByText} = renderWithProviders(
            <DisconnectedFileBrowser
                {...initialProps}
                error="some error"
            />
        );

        expect(getByText(/collection does not exist/i)).toBeInTheDocument();
    });


    it('show error when when an error messsage is given', () => {
        const {getByText} = renderWithProviders(
            <DisconnectedFileBrowser
                {...initialProps}
                openedCollection={openedCollection}
                error="some error"
            />
        );

        // finds substring ignoring case
        expect(getByText(/error occurred/i)).toBeInTheDocument();
    });

    it('cleans up listener after unmount', () => {
        const cleanupFn = jest.fn();

        const {unmount} = renderWithProviders(
            <DisconnectedFileBrowser
                {...initialProps}
                history={{
                    listen: () => cleanupFn
                }}
            />
        );

        unmount();

        expect(cleanupFn).toHaveBeenCalledTimes(1);
    });
});
