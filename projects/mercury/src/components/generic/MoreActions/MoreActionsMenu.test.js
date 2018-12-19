import React from 'react';
import {createShallow} from '@material-ui/core/test-utils';
import MoreActionsMenu from "./MoreActionsMenu";
import ActionItem from "./ActionItem";

describe('MoreActionsMenu', () => {
    let shallow;

    beforeAll(() => {
        shallow = createShallow();
    });

    it('should render menuItems as child components', () => {
        const dummyMenuItems = [
            <ActionItem key={0}>Foo</ActionItem>,
            <ActionItem key={1}>Bar</ActionItem>
        ];
        const wrapper = shallow(
            <MoreActionsMenu menuItems={dummyMenuItems} />
        );
        expect(wrapper.find('ActionItem').at(0).childAt(0).text()).toEqual('Foo');
        expect(wrapper.find('ActionItem').at(1).childAt(0).text()).toEqual('Bar');
    });
});
