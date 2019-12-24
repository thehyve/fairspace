/* eslint-disable react/jsx-props-no-spreading */
import React from 'react';
import {cleanup, fireEvent, render} from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

import FileList from '../FileList';

afterEach(cleanup);

describe('FileList', () => {
    const files = [
        {
            filename: "/Collection/q",
            basename: "base-file",
            lastmod: "Wed, 09 Oct 2019 16:17:37 GMT",
            size: 0,
            type: "directory",
            etag: null,
            selected: false
        }
    ];

    it('shows warning when no files are present', () => {
        const {queryByText} = render(<FileList files={[]} />);

        expect(queryByText('Empty directory')).toBeInTheDocument();
    });

    it('renders view when files are provided', () => {
        const {queryByText} = render(<FileList files={files} />);

        expect(queryByText(/empty directory/i)).not.toBeInTheDocument();
        expect(queryByText(/name/i)).toBeInTheDocument();
        expect(queryByText(/size/i)).toBeInTheDocument();
        expect(queryByText(/last modified/i)).toBeInTheDocument();
        expect(queryByText(/base-file/i)).toBeInTheDocument();
    });

    it('calls onPathCheckboxClick when the checkbox container is clicked', () => {
        const onPathCheckboxClick = jest.fn();

        const {getByTestId} = render(<FileList
            onPathCheckboxClick={onPathCheckboxClick}
            selectionEnabled
            files={files}
        />);

        const cell = getByTestId('checkbox-cell');

        fireEvent.click(cell);

        expect(onPathCheckboxClick).toHaveBeenCalledTimes(1);
    });

    it('does not render the chekbox when selection is disabled', () => {
        const {queryByTestId} = render(<FileList
            selectionEnabled={false}
            files={files}
        />);

        expect(queryByTestId('checkbox-cell')).not.toBeInTheDocument();
    });
});
