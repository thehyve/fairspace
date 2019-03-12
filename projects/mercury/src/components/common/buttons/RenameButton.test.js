import React from 'react';
import {Dialog} from "@material-ui/core";
import {shallow} from "enzyme";

import RenameButton from './RenameButton';

describe('<DeleteButton />', () => {
    it('should open dialog if not disabled and clicked', () => {
        const onRename = jest.fn();
        const wrapper = shallow(
            <RenameButton onRename={onRename}>
                <div>something</div>
            </RenameButton>
        );

        wrapper.childAt(0).simulate('click');
        expect(wrapper.find(Dialog).length).toEqual(1);
    });

    it('should not open dialog if disabled', () => {
        const onRename = jest.fn();
        const wrapper = shallow(
            <RenameButton disabled onRename={onRename}>
                <div>something</div>
            </RenameButton>
        );

        wrapper.childAt(0).simulate('click');
        expect(wrapper.find(Dialog).length).toEqual(0);
    });

    it('should call onRename if not disabled', () => {
        const onRename = jest.fn();
        const wrapper = shallow(
            <RenameButton onRename={onRename}>
                <div>something</div>
            </RenameButton>
        );

        wrapper.childAt(0).simulate('click');
        expect(onRename.mock.calls.length).toEqual(0);
    });

    it('should not call onRename if disabled', () => {
        const onRename = jest.fn();
        const wrapper = shallow(
            <RenameButton disabled onRename={onRename}>
                <div>something</div>
            </RenameButton>
        );

        wrapper.childAt(0).simulate('click');
        expect(onRename.mock.calls.length).toEqual(0);
    });
});
