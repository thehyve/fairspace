/* eslint-disable jsx-a11y/anchor-has-content */
import React from 'react';
import {configure} from 'enzyme';
import Adapter from '@wojtekmaj/enzyme-adapter-react-17';
// eslint-disable-next-line import/no-extraneous-dependencies
import {fireEvent, render} from '@testing-library/react';
import {ThemeProvider} from '@mui/material/styles';
import LinkedDataLink from '../LinkedDataLink';
import theme from '../../../App.theme';
import UserContext from '../../../users/UserContext';

// Enzyme is obsolete, the Adapter allows running our old tests.
// For new tests use React Testing Library. Consider migrating enzyme tests when refactoring.
configure({adapter: new Adapter()});
jest.mock('../LinkedDataEntityPage', () => () => <div>Mocked Metadata Page</div>);

describe('LinkedDataLink', () => {
    it('renders LinkedDataLink without crashing', () => {
        const {getByText} = render(
            <UserContext.Provider value={{currentUser: {canViewPublicMetadata: true}}}>
                <ThemeProvider theme={theme}>
                    <LinkedDataLink uri="testUri">Test Content</LinkedDataLink>
                </ThemeProvider>
            </UserContext.Provider>
        );
        expect(getByText('Test Content')).toBeInTheDocument();
    });

    it('shows the modal when clicked', () => {
        const {getByText, queryByText} = render(
            <UserContext.Provider value={{currentUser: {canViewPublicMetadata: true}}}>
                <ThemeProvider theme={theme}>
                    <LinkedDataLink uri="testUri">Test Content</LinkedDataLink>
                </ThemeProvider>
            </UserContext.Provider>
        );
        expect(queryByText('Mocked Metadata Page')).not.toBeInTheDocument();

        fireEvent.click(getByText('Test Content'));
        expect(getByText('Mocked Metadata Page')).toBeInTheDocument();
    });

    it('closes the modal when close icon is clicked', () => {
        const {getByText, getByTestId, queryByText} = render(
            <UserContext.Provider value={{currentUser: {canViewPublicMetadata: true}}}>
                <ThemeProvider theme={theme}>
                    <LinkedDataLink uri="testUri">Test Content</LinkedDataLink>
                </ThemeProvider>
            </UserContext.Provider>
        );

        fireEvent.click(getByText('Test Content'));
        expect(getByText('Mocked Metadata Page')).toBeInTheDocument();

        const close = getByTestId('CloseIcon');
        fireEvent.click(close);
        expect(queryByText('Mocked Metadata Page')).not.toBeInTheDocument();
    });
});
