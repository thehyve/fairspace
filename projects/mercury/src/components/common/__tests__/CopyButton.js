import React from 'react';
import {act} from 'react-dom/test-utils';
import {mount} from "enzyme";

import {Tooltip} from "@material-ui/core";
import {ClipboardText, ClipboardCheck} from "mdi-material-ui/light";
import CopyButton from "../CopyButton";
import ClipboardCopy from "../ClipboardCopy";

describe('<CopyButton />', () => {
    jest.useFakeTimers();

    it('changes the icon and shows a popup after copying', () => {
        const wrapper = mount(<CopyButton />);

        expect(wrapper.find(ClipboardText).length).toEqual(1);

        // Simulate copying
        act(() => {
            const onCopyHandler = wrapper.find(ClipboardCopy).at(0).prop("onCopy");
            onCopyHandler();
        });

        // An update to the wrapper seems to be needed due to the use of a webcomponent
        wrapper.update();
        expect(wrapper.find(Tooltip).length).toEqual(1);
        expect(wrapper.find(ClipboardCheck).length).toEqual(1);
    });

    it('changes restores the original icon icon after some timeout', () => {
        const wrapper = mount(<CopyButton timeout={50} />);

        // Simulate copying
        act(() => {
            const onCopyHandler = wrapper.find(ClipboardCopy).at(0).prop("onCopy");
            onCopyHandler();
        });

        // An update to the wrapper seems to be needed due to the use of a webcomponent
        wrapper.update();
        expect(wrapper.find(ClipboardCheck).length).toEqual(1);

        act(() => {
            jest.advanceTimersByTime(100);
        });

        // An update to the wrapper seems to be needed due to the use of a webcomponent
        wrapper.update();
        expect(wrapper.find(ClipboardText).length).toEqual(1);
    });
});
