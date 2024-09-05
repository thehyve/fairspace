import React from 'react';
import {render, fireEvent} from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import {ThemeProvider} from '@mui/material/styles';
import TablePaginationActions from '../TablePaginationActions';
import theme from '../../../App.theme';

describe('TablePaginationActions', () => {
    const defaultProps = {
        count: 100,
        page: 0,
        rowsPerPage: 10,
        onPageChange: jest.fn()
    };

    const renderComponent = (props = {}) => {
        return render(
            <ThemeProvider theme={theme}>
                <TablePaginationActions {...defaultProps} {...props} />
            </ThemeProvider>
        );
    };

    it('renders all arrow buttons', () => {
        const {getByLabelText} = renderComponent();
        expect(getByLabelText('first page')).toBeInTheDocument();
        expect(getByLabelText('previous page')).toBeInTheDocument();
        expect(getByLabelText('next page')).toBeInTheDocument();
        expect(getByLabelText('last page')).toBeInTheDocument();
    });

    it('disables next and last buttons on last page', () => {
        const props = {...defaultProps, page: 9};
        const {getByLabelText} = renderComponent(props);
        expect(getByLabelText('next page')).toBeDisabled();
        expect(getByLabelText('last page')).toBeDisabled();
    });

    it('calls onPageChange with correct arguments when first page button is clicked', () => {
        const props = {...defaultProps, page: 1};
        const {getByLabelText} = renderComponent(props);
        fireEvent.click(getByLabelText('first page'));
        expect(defaultProps.onPageChange).toHaveBeenCalledWith(expect.anything(), 0);
    });
    it('calls onPageChange with correct arguments when previous page button is clicked', () => {
        const props = {...defaultProps, page: 1};
        const {getByLabelText} = renderComponent(props);
        fireEvent.click(getByLabelText('previous page'));
        expect(props.onPageChange).toHaveBeenCalledWith(expect.anything(), 0);
    });

    it('calls onPageChange with correct arguments when next page button is clicked', () => {
        const {getByLabelText} = renderComponent();
        fireEvent.click(getByLabelText('next page'));
        expect(defaultProps.onPageChange).toHaveBeenCalledWith(expect.anything(), 1);
    });

    it('calls onPageChange with correct arguments when last page button is clicked', () => {
        const {getByLabelText} = renderComponent();
        fireEvent.click(getByLabelText('last page'));
        expect(defaultProps.onPageChange).toHaveBeenCalledWith(expect.anything(), 9);
    });

    it('disables last page button when countDisplayLimitReached is true', () => {
        const props = {...defaultProps, countDisplayLimitReached: true};
        const {getByLabelText} = renderComponent(props);
        expect(getByLabelText('last page')).toBeDisabled();
    });

    it('shows tooltip when countDisplayLimitReached is true', () => {
        const props = {countDisplayLimitReached: true};
        const {getByLabelText} = renderComponent(props);
        fireEvent.mouseOver(getByLabelText('last page'));
        expect(getByLabelText('Total page count not available')).toBeInTheDocument();
    });

    it('enables next page button when countDisplayLimitReached is true and hasNextFlag is true', () => {
        const props = {...defaultProps, countDisplayLimitReached: true, hasNextFlag: true};
        const {getByLabelText} = renderComponent(props);
        expect(getByLabelText('next page')).not.toBeDisabled();
    });
});
