// @ts-nocheck
import React from "react";
import {configure, shallow} from "enzyme";
import Adapter from "@wojtekmaj/enzyme-adapter-react-17";
import {act} from "react-dom/test-utils";
import {FilesPage} from "../FilesPage";
import CollectionInformationDrawer from "../../collections/CollectionInformationDrawer";
import FileBrowser from "../FileBrowser";
import {getPathInfoFromParams} from "../fileUtils";
// Enzyme is obsolete, the Adapter allows running our old tests.
// For new tests use React Testing Library. Consider migrating enzyme tests when refactoring.
configure({
    adapter: new Adapter()
});
const collections = [{
    iri: 'http://test',
    name: 'My collection',
    description: 'description'
}];

function shallowRender(history, path, locationSearch = '') {
    const match = {
        params: {
            collection: 'My collection',
            path
        }
    };
    const {
        openedPath
    } = getPathInfoFromParams(match.params);
    return shallow(<FilesPage openedPath={openedPath} location={{
        search: locationSearch
    }} history={history} selectCollection={() => {}} collection={collections[0]} classes={{}} currentUser={{
        canViewPublicMetadata: true
    }} />);
}

describe('FilesPage', () => {
    let wrapper;
    it('renders a file browser and information drawer', () => {
        const history = [];
        act(() => {
            wrapper = shallowRender(history, '');
        });
        const fileBrowserProps = wrapper.find(FileBrowser).first().props();
        expect(fileBrowserProps.openedPath).toBe('/My collection');
        expect(fileBrowserProps.openedCollection.name).toBe('My collection');
        const informationDrawerProps = wrapper.find(CollectionInformationDrawer).first().props();
        expect(informationDrawerProps.selectedCollectionIri).toBe('http://test');
    });
    it('renders a file browser and information drawer for a specified path', () => {
        const history = [];
        act(() => {
            wrapper = shallowRender(history, 'music/jazz');
        });
        const fileBrowserProps = wrapper.find(FileBrowser).first().props();
        expect(fileBrowserProps.openedPath).toBe('/My collection/music/jazz');
        expect(fileBrowserProps.openedCollection.name).toBe('My collection');
        const informationDrawerProps = wrapper.find(CollectionInformationDrawer).first().props();
        expect(informationDrawerProps.selectedCollectionIri).toBe('http://test');
    });
});