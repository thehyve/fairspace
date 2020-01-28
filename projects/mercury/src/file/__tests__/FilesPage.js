import React from 'react';
import {shallow} from "enzyme";
import {act} from 'react-dom/test-utils';

import {FilesPage} from "../FilesPage";
import InformationDrawer from "../../common/components/InformationDrawer";
import FileBrowser from '../FileBrowser';

const collections = [
    {
        iri: 'http://test',
        name: 'My collection',
        description: 'description',
        location: 'location1'
    }
];

function shallowRender(history, openedPath, locationSearch = '') {
    return shallow(
        <FilesPage
            match={{
                params: {
                    collection: 'location1',
                    path: openedPath
                }
            }}
            location={{
                search: locationSearch
            }}
            history={history}
            selectCollection={() => {}}
            collections={collections}
        />
    );
}

describe('FilesPage', () => {
    let wrapper;

    it('renders a file browser and information drawer', () => {
        const history = [];

        act(() => {
            wrapper = shallowRender(history, '');
        });

        const fileBrowserProps = wrapper.find(FileBrowser).first().props();
        expect(fileBrowserProps.openedPath).toBe('/location1');
        expect(fileBrowserProps.openedCollection.location).toBe('location1');
        const informationDrawerProps = wrapper.find(InformationDrawer).first().props();
        expect(informationDrawerProps.selectedCollectionIri).toBe('http://test');
    });

    it('renders a file browser and information drawer for a specified path', () => {
        const history = [];

        act(() => {
            wrapper = shallowRender(history, 'music/jazz');
        });

        const fileBrowserProps = wrapper.find(FileBrowser).first().props();
        expect(fileBrowserProps.openedPath).toBe('/location1/music/jazz');
        expect(fileBrowserProps.openedCollection.location).toBe('location1');
        const informationDrawerProps = wrapper.find(InformationDrawer).first().props();
        expect(informationDrawerProps.selectedCollectionIri).toBe('http://test');
    });
});
