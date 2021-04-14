/* eslint-disable react/jsx-props-no-spreading */
import React from 'react';
import {cleanup, render} from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import {shallow} from "enzyme";
import {ExternalStorageBrowser} from "../ExternalStorageBrowser";
import type {ExternalStorage} from "../ExternalStoragesContext";
import LoadingInlay from "../../common/components/LoadingInlay";

afterEach(cleanup);

const fileActionsMock = {
    getDownloadLink: () => 'http://a'
};

const selectionMock = {
    isSelected: () => false,
    selected: [],
    toggle: () => {}
};

const storageMock: ExternalStorage = {
    name: "testStorage",
    label: "Test storage",
    url: "https://example.com/api/webdav"
};

const initialProps = {
    openedPath: '/',
    history: {
        listen: () => {}
    },
    storage: storageMock,
    files: [{
        filename: 'a'
    }],
    fileActions: fileActionsMock,
    selection: selectionMock,
    classes: {}
};

describe('ExternalStorageBrowser', () => {
    it('renders proper view', () => {
        const {queryByTestId} = render(
            <ExternalStorageBrowser
                {...initialProps}
            />
        );

        expect(queryByTestId('externals-storage-view')).toBeInTheDocument();
    });

    it('show data loading error when ehn error on fetching files occurs', () => {
        const {getByText} = render(
            <ExternalStorageBrowser
                {...initialProps}
                error="some error"
            />
        );

        expect(getByText("An error occurred while loading data from Test storage.")).toBeInTheDocument();
    });

    it('show loading inlay as long as the files are pending', () => {
        const wrapper = shallow(
            <ExternalStorageBrowser
                {...initialProps}
                loading
            />
        );

        expect(wrapper.find(LoadingInlay).length).toBe(1);
    });
});
