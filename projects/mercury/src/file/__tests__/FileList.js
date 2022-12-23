/* eslint-disable react/jsx-props-no-spreading */
import React from 'react';
import {cleanup, fireEvent, render} from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

import {mount} from "enzyme";
import {TableRow} from "@mui/material";
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
        expect(queryByText(/deleted/i)).not.toBeInTheDocument();
        expect(queryByText(/name/i)).toBeInTheDocument();
        expect(queryByText(/size/i)).toBeInTheDocument();
        expect(queryByText(/last modified/i)).toBeInTheDocument();
        expect(queryByText(/base-file/i)).toBeInTheDocument();
    });

    it('renders view with deleted column in "show deleted" mode', () => {
        const {queryByText} = render(<FileList files={files} showDeleted />);

        expect(queryByText(/empty directory/i)).not.toBeInTheDocument();
        expect(queryByText(/deleted/i)).toBeInTheDocument();
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

    it('does not render the checkbox when selection is disabled', () => {
        const {queryByTestId} = render(<FileList
            selectionEnabled={false}
            files={files}
        />);

        expect(queryByTestId('checkbox-cell')).not.toBeInTheDocument();
    });

    it('filters files by basename on filter input change', () => {
        const allFiles = [
            {
                filename: "/Collection/q",
                basename: "base-dir",
                lastmod: "Wed, 09 Oct 2019 16:17:37 GMT",
                size: 0,
                type: "directory",
                etag: null,
                selected: false
            },
            {
                filename: "/Collection/f1",
                basename: "base-file",
                lastmod: "Thu, 10 Oct 2019 12:12:31 GMT",
                size: 0,
                type: "file",
                etag: null,
                selected: false
            }];

        const wrapper = mount(<FileList
            selectionEnabled={false}
            files={allFiles}
        />);
        expect(wrapper.find(TableRow).length).toBe(3);

        const nameField = wrapper.find('input#filter').first();
        nameField.simulate('focus');
        nameField.simulate('change', {target: {value: 'file'}});

        expect(wrapper.find(TableRow).length).toBe(2);
    });
});
