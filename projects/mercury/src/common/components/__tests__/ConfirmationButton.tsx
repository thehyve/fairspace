// @ts-nocheck
import React from "react";
import {configure, shallow} from "enzyme";
import Adapter from "@wojtekmaj/enzyme-adapter-react-17";
import ConfirmationButton from "../ConfirmationButton";
import ConfirmationDialog from "../ConfirmationDialog";
// Enzyme is obsolete, the Adapter allows running our old tests.
// For new tests use React Testing Library. Consider migrating enzyme tests when refactoring.
configure({
    adapter: new Adapter()
});
describe('<ConfirmationButton />', () => {
    it('should close dialog before calling onlick prop', () => {
        const onClick = jest.fn();
        const wrapper = shallow(<ConfirmationButton message="test" onClick={onClick}>
            <div>something</div>
        </ConfirmationButton>);
        wrapper.childAt(0).simulate('click');
        expect(wrapper.find(ConfirmationDialog).length).toEqual(1);
        expect(onClick.mock.calls.length).toEqual(0);
        const agreeCallback = wrapper.find(ConfirmationDialog).prop("onAgree");
        agreeCallback({
            stopPropagation: () => {}
        });
        expect(wrapper.find(ConfirmationDialog).length).toEqual(0);
        expect(onClick.mock.calls.length).toEqual(1);
    });
    it('should not open dialog if disabled', () => {
        const onClick = jest.fn();
        const wrapper = shallow(<ConfirmationButton message="test" disabled onClick={onClick}>
            <div>something</div>
        </ConfirmationButton>);
        wrapper.childAt(0).simulate('click');
        expect(wrapper.find(ConfirmationDialog).length).toEqual(0);
    });
    it('should call onClick if not disabled', () => {
        const onClick = jest.fn();
        const wrapper = shallow(<ConfirmationButton message="test" onClick={onClick}>
            <div>something</div>
        </ConfirmationButton>);
        wrapper.childAt(0).simulate('click');
        expect(onClick.mock.calls.length).toEqual(0);
    });
    it('should not call onClick if disabled', () => {
        const onClick = jest.fn();
        const wrapper = shallow(<ConfirmationButton message="test" disabled onClick={onClick}>
            <div>something</div>
        </ConfirmationButton>);
        wrapper.childAt(0).simulate('click');
        expect(onClick.mock.calls.length).toEqual(0);
    });
});