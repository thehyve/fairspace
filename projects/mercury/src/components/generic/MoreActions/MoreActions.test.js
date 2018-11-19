import React from 'react';
import {createShallow} from '@material-ui/core/test-utils';
import MoreActions from "./MoreActions";

describe('MoreIconButton', () => {
    let shallow;

    beforeAll(() => {
        shallow = createShallow();
    });

    it('should render the sub components', () => {
        const wrapper = shallow(
            <MoreActions onClick={jest.fn()} className={{}}/>
        );
        expect(wrapper.find('WithStyles(IconButton)').length).toBe(1);
        expect(wrapper.find('MoreActionsMenu').length).toBe(1);
    });
});
