import React from 'react';
import {act} from 'react-dom/test-utils';
import {mount, shallow} from "enzyme";
import {Tooltip} from "@material-ui/core";
import {AssignmentOutlined, AssignmentTurnedInOutlined} from '@material-ui/icons';

import '../__mocks__/clipboard.mock';
import CopyButton from "../CopyButton";

describe('<CopyButton />', () => {
    jest.useFakeTimers();

    it('changes the icon and title after copying', () => {
        const wrapper = shallow(<CopyButton
            labelPreCopy="Copy full IRI"
            labelAfterCopy="Copied!"
        />);

        expect(wrapper.find(AssignmentOutlined).length).toEqual(1);
        expect(wrapper.find(Tooltip).at(0).prop("title")).toBe('Copy full IRI');

        // Simulate copying
        wrapper.find(Tooltip).simulate('click');

        expect(wrapper.find(Tooltip).length).toEqual(1);
        expect(wrapper.find(Tooltip).at(0).prop("title")).toBe('Copied!');
        expect(wrapper.find(AssignmentTurnedInOutlined).length).toEqual(1);
    });

    it('changes restores the original icon icon after some timeout', () => {
        const wrapper = mount(<CopyButton timeout={50} />);

        // Simulate copying
        wrapper.find(Tooltip).simulate('click');

        expect(wrapper.find(AssignmentTurnedInOutlined).length).toEqual(1);

        act(() => {
            jest.advanceTimersByTime(100);
        });

        wrapper.update();
        expect(wrapper.find(AssignmentOutlined).length).toEqual(1);
    });
});
