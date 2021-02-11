import React from 'react';
import {shallow} from "enzyme";
import {act} from 'react-dom/test-utils';

import {ExternalStoragePage} from "../ExternalStoragePage";
import ExternalStorageBrowser from "../ExternalStorageBrowser";
import MessageDisplay from "../../common/components/MessageDisplay";

const storages = [
    {
        url: 'http://xyz',
        name: 'xyz',
        label: 'Some external storage'
    }
];

function shallowRender(path = '', storage = 'xyz') {
    const match = {
        params: {
            storage
        }
    };
    return shallow(
        <ExternalStoragePage
            match={match}
            location={{
                pathname: path
            }}
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

    it('displays an error if storage does not exist', () => {
        act(() => {
            wrapper = shallowRender('', 'test');
        });

        expect(wrapper.find(ExternalStorageBrowser).length).toBe(0);
        expect(wrapper.find(MessageDisplay).first().props().message).toBe('Storage "test" not found.');
    });
});
