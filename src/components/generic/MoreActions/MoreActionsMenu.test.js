import React from 'react';
import {createShallow} from '@material-ui/core/test-utils';
import MoreActionsMenu from "./MoreActionsMenu";
import MoreAction from "./MoreAction";

describe('MoreActionsMenu', () => {
    let shallow;

    beforeAll(() => {
        shallow = createShallow();
    });

    it('should render menuItems as child components', () => {
        const dummyMenuItems = [
            <MoreAction key={0}>Foo</MoreAction>,
            <MoreAction key={1}>Bar</MoreAction>
        ];
        const wrapper = shallow(
            <MoreActionsMenu menuItems={dummyMenuItems}/>
        );
        expect(wrapper.find('MoreAction').at(0).childAt(0).text()).toEqual('Foo');
        expect(wrapper.find('MoreAction').at(1).childAt(0).text()).toEqual('Bar');
    });
});
