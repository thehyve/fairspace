import React from 'react';
import {configure, shallow} from 'enzyme';
import Adapter from '@wojtekmaj/enzyme-adapter-react-17';
import {ExternalStorageInformationDrawer} from '../ExternalStorageInformationDrawer';
import EmptyInformationDrawer from '../../common/components/EmptyInformationDrawer';

// Enzyme is obsolete, the Adapter allows running our old tests.
// For new tests use React Testing Library. Consider migrating enzyme tests when refactoring.
configure({adapter: new Adapter()});

describe('ExternalStorageInformationDrawer', () => {
    const defaultProps = {
        atLeastSingleRootFileExists: true,
        path: '',
        selected: null,
        storage: {name: 'test'},
        users: []
    };

    it('renders empty information drawer for the root folder', () => {
        const wrapper = shallow(<ExternalStorageInformationDrawer {...defaultProps} />);

        const collectionDetailsProps = wrapper.find(EmptyInformationDrawer).first().props();
        expect(collectionDetailsProps.message).toBe(
            'Select a file or a folder to display its metadata'
        );
    });
});
