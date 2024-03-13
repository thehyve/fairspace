/* eslint-disable react/jsx-props-no-spreading */
import React from 'react';
import {cleanup, render, screen} from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import {configure} from 'enzyme';
import Adapter from '@wojtekmaj/enzyme-adapter-react-17';
import {ThemeProvider} from '@mui/material/styles';
import {ExternalStorageBrowser} from '../ExternalStorageBrowser';
import type {ExternalStorage} from '../ExternalStoragesContext';
import theme from '../../App.theme';

// Enzyme is obsolete, the Adapter allows running our old tests.
// For new tests use React Testing Library. Consider migrating enzyme tests when refactoring.
configure({adapter: new Adapter()});

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
    name: 'testStorage',
    label: 'Test storage',
    url: 'https://example.com/api/webdav'
};

const initialProps = {
    openedPath: '/',
    history: {
        listen: () => {}
    },
    storage: storageMock,
    files: [
        {
            filename: 'a'
        }
    ],
    fileActions: fileActionsMock,
    selection: selectionMock,
    classes: {}
};

describe('ExternalStorageBrowser', () => {
    it('renders proper view', () => {
        const {queryByTestId} = render(
            <ThemeProvider theme={theme}>
                <ExternalStorageBrowser {...initialProps} />
            </ThemeProvider>
        );

        expect(queryByTestId('externals-storage-view')).toBeInTheDocument();
    });

    it('show data loading error when ehn error on fetching files occurs', () => {
        const {getByText} = render(
            <ThemeProvider theme={theme}>
                <ExternalStorageBrowser {...initialProps} error="some error" />
            </ThemeProvider>
        );

        expect(
            getByText('An error occurred while loading data from Test storage.')
        ).toBeInTheDocument();
    });

    it('show loading inlay as long as the files are pending', () => {
        render(
            <ThemeProvider theme={theme}>
                <ExternalStorageBrowser {...initialProps} loading />
            </ThemeProvider>
        );

        expect(screen.getByTestId('loading')).toBeInTheDocument();
    });
});
