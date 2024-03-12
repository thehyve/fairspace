import React from 'react';
import { fireEvent, render } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import RenameButton from '../RenameButton';

describe('<RenameButton />', () => {
    it('shows dialog when clicking on children', () => {
        const { container, queryByText } = render(
            <RenameButton
                onRename={() => {}}
                currentName="filename"
            >
                <div>something</div>
            </RenameButton>,
        );

        fireEvent.click(container.firstChild);

        expect(queryByText(/rename filename/i)).toBeInTheDocument();
    });

    it('should not open dialog if disabled', () => {
        const { container, queryByText } = render(
            <RenameButton
                disabled
                onRename={() => {}}
                currentName="filename"
            >
                <div>something</div>
            </RenameButton>,
        );

        fireEvent.click(container.firstChild);

        expect(queryByText(/rename filename/i)).not.toBeInTheDocument();
    });

    it('should call onRename if not disabled', () => {
        const onRename = jest.fn(() => Promise.resolve());
        const { container, getByTestId, getByLabelText } = render(
            <RenameButton
                onRename={onRename}
                currentName="filename"
            >
                <div>something</div>
            </RenameButton>,
        );

        // Open dialog -> change input -> click rename
        fireEvent.click(container.firstChild);
        const input = getByLabelText('Name');
        fireEvent.change(input, { target: { value: 'new filename' } });
        fireEvent.submit(getByTestId('form'));

        expect(onRename).toHaveBeenCalledTimes(1);
    });

    it('should not find input and not call onRename if disabled', () => {
        const onRename = jest.fn(() => Promise.resolve());
        const { container, queryByLabelText } = render(
            <RenameButton
                disabled
                onRename={onRename}
                currentName="filename"
            >
                <div>something</div>
            </RenameButton>,
        );

        fireEvent.click(container.firstChild);
        expect(queryByLabelText('Name')).not.toBeInTheDocument();
        expect(onRename).toHaveBeenCalledTimes(0);
    });

    it('should disable if invalid file name', () => {
        const onRename = jest.fn(() => Promise.resolve());
        const { container, getByTestId, getByLabelText } = render(
            <RenameButton
                onRename={onRename}
                currentName="filename"
            >
                <div>something</div>
            </RenameButton>,
        );

        // Open dialog -> change input -> click rename
        fireEvent.click(container.firstChild);
        const input = getByLabelText('Name');

        // Invalid name: '.'
        fireEvent.change(input, { target: { value: '.' } });
        fireEvent.submit(getByTestId('form'));
        expect(onRename).toHaveBeenCalledTimes(0);

        // Invalid name: '..'
        fireEvent.change(input, { target: { value: '..' } });
        fireEvent.submit(getByTestId('form'));
        expect(onRename).toHaveBeenCalledTimes(0);

        // Invalid name with '/'
        fireEvent.change(input, { target: { value: 'test/value' } });
        fireEvent.submit(getByTestId('form'));
        expect(onRename).toHaveBeenCalledTimes(0);

        // Valid name
        fireEvent.change(input, { target: { value: 'valid name' } });
        fireEvent.submit(getByTestId('form'));
        expect(onRename).toHaveBeenCalledTimes(1);
    });
});
