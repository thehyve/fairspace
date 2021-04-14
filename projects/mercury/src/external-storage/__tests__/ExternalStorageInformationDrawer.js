import React from 'react';
import {shallow} from "enzyme";

import {ExternalStorageInformationDrawer} from "../ExternalStorageInformationDrawer";
import EmptyInformationDrawer from "../../common/components/EmptyInformationDrawer";

describe('ExternalStorageInformationDrawer', () => {
    const defaultProps = {
        atLeastSingleRootFileExists: true,
        path: '',
        selected: null,
        storage: {name: "test"},
        users: []
    };

    it('renders empty information drawer for the root folder', () => {
        const wrapper = shallow(<ExternalStorageInformationDrawer
            {...defaultProps}
        />);

        const collectionDetailsProps = wrapper.find(EmptyInformationDrawer).first().props();
        expect(collectionDetailsProps.message).toBe('Select a file or a folder to display its metadata');
    });
});
