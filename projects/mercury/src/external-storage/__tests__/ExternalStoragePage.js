import React from 'react';
import {configure, shallow} from 'enzyme';
import Adapter from '@wojtekmaj/enzyme-adapter-react-17';

import {act} from 'react-dom/test-utils';

import {ExternalStoragePage} from '../ExternalStoragePage';
import ExternalStorageBrowser from '../ExternalStorageBrowser';
import MessageDisplay from '../../common/components/MessageDisplay';

// Enzyme is obsolete, the Adapter allows running our old tests.
// For new tests use React Testing Library. Consider migrating enzyme tests when refactoring.
configure({adapter: new Adapter()});

const storages = [
    {
        url: 'http://xyz',
        name: 'xyz',
        label: 'Some external storage'
    }
];

function shallowRender(path = '', storage = 'xyz', location) {
    const match = {
        params: {
            storage
        }
    };
    return shallow(
        <ExternalStoragePage
            match={match}
            location={location || {pathname: path}}
            externalStorages={storages}
            classes={{}}
        />
    );
}

describe('ExternalStoragePage', () => {
    let wrapper;

    it('renders an external storage browser and information drawer', () => {
        act(() => {
            wrapper = shallowRender();
        });

        const externalStorageBrowserProps = wrapper.find(ExternalStorageBrowser).first().props();
        expect(externalStorageBrowserProps.pathname).toBe('');
        expect(externalStorageBrowserProps.storage.name).toBe('xyz');
        expect(externalStorageBrowserProps.storage.label).toBe('Some external storage');
        // const informationDrawerProps = wrapper.find(InformationDrawer).first().props(); // TODO
    });

    it('renders a file browser and information drawer for a specified path', () => {
        act(() => {
            wrapper = shallowRender('music/jazz');
        });

        const externalStorageBrowserProps = wrapper.find(ExternalStorageBrowser).first().props();
        expect(externalStorageBrowserProps.pathname).toBe('music/jazz');
        expect(externalStorageBrowserProps.storage.name).toBe('xyz');
    });

    it('renders a file browser with a preselected file', () => {
        const location = {
            pathname: '/external-storages/xyz/collection 2021-05-27_13_39-2/dir_0',
            search: '?selection=%2Fcollection%202021-05-27_13_39-2%2Fdir_0%2Fcoffee_139.jpg'
        };
        act(() => {
            wrapper = shallowRender(
                '/external-storages/xyz/collection 2021-05-27_13_39-2/dir_0',
                'xyz',
                location
            );
        });

        const externalStorageBrowserProps = wrapper.find(ExternalStorageBrowser).first().props();
        expect(externalStorageBrowserProps.preselectedFile).toBe(
            '/collection 2021-05-27_13_39-2/dir_0/coffee_139.jpg'
        );
    });

    it('displays an error if storage does not exist', () => {
        act(() => {
            wrapper = shallowRender('', 'test');
        });

        expect(wrapper.find(ExternalStorageBrowser).length).toBe(0);
        expect(wrapper.find(MessageDisplay).first().props().message).toBe(
            'Storage "test" not found.'
        );
    });
});
