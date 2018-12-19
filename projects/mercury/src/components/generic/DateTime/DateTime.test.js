import React from 'react';
import DateTime from './DateTime';
import {mount} from 'enzyme';

describe('DateTime unit tests', () => {

    let mountedDateTime;

    const dateTime = (value) => {
        if (!mountedDateTime) {
            mountedDateTime = mount(<DateTime value={value} />)
        }
        return mountedDateTime;
    }

    beforeEach(() => {
        mountedDateTime = undefined;
    });

    it('should show date when it is not today', () => {
        const dateValue = '2008-09-15T15:53:00';
        const wrapper = dateTime(dateValue);
        expect(wrapper.text()).toEqual('Sep 15, 2008');
    });

    it('should show time when it is today', () => {
        const dateValue = new Date().toISOString();
        const wrapper = dateTime(dateValue);
        const text = wrapper.text();
        expect(text).not.toContain(',');
        expect(text).toContain(':');
        expect(text).toContain('M');
    });
});
