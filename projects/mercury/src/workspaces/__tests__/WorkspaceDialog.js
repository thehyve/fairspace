import React from 'react';
import '@testing-library/jest-dom/extend-expect';
import {mount} from "enzyme";
import WorkspaceDialog from '../WorkspaceDialog';

let onSubmit;
let onClose;
let workspaceDialog;
let wrapper;

const enterValue = (value) => {
    const nameField = wrapper.find('input#name').first();
    nameField.simulate('focus');
    nameField.simulate('change', {target: {value}});
};

beforeEach(() => {
    onSubmit = jest.fn();
    onClose = jest.fn();
    workspaceDialog = (
        <WorkspaceDialog
            onSubmit={onSubmit}
            onClose={onClose}
            creating={false}
            workspaces={[{name: "w1"}]}
        />
    );
    wrapper = mount(workspaceDialog);
});

describe('WorkspaceDialog', () => {
    it('should enable and disable submit button at proper times', () => {
        expect((wrapper.find('[data-testid="submit-button"]').first()).prop('disabled')).toBe(true);
        enterValue('a');
        expect((wrapper.find('[data-testid="submit-button"]').first()).prop('disabled')).toBe(false);
    });

    it('should send all entered parameters to the creation method', () => {
        enterValue('a');
        const submitButton = wrapper.find('[data-testid="submit-button"]').first();
        submitButton.simulate('click');
        expect(onSubmit).toHaveBeenCalledTimes(1);
        expect(onSubmit).toHaveBeenCalledWith({name: 'a'});
    });

    it('should require unique workspace code', () => {
        enterValue('w1');
        const submitButton = wrapper.find('[data-testid="submit-button"]').first();
        expect((submitButton).prop('disabled')).toBe(true);
    });

    it('should warn if workspace code is too long', () => {
        enterValue('w123456789');
        expect(wrapper.text().includes('Warning!')).toBe(false);
        enterValue('w123456789+');
        expect(wrapper.text().includes('Warning!')).toBe(true);
    });
});
