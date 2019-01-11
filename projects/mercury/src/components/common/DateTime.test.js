import React from 'react';
import {mount} from 'enzyme';
import DateTime from './DateTime';

describe('DateTime unit tests', () => {
    it('should show date when it is not today', () => {
        const dateValue = '2008-09-15T15:53:00';
        const wrapper = mount(<DateTime value={dateValue} />);
        expect(wrapper.text()).toEqual('Sep 15, 2008');
    });

    it('should show time when it is today', () => {
        const dateValue = new Date().toISOString();
        const wrapper = mount(<DateTime value={dateValue} />);
        const text = wrapper.text();
        expect(text).not.toContain(',');
        expect(text).toContain(':');
        expect(text).toContain('M');
    });
});
