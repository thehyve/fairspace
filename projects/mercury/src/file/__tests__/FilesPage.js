import React from 'react';
import {shallow} from "enzyme";

import {FilesPage} from "../FilesPage";
import InformationDrawer from "../../common/components/InformationDrawer";

function shallowRender(history, openedPath) {
    const openedCollection = {
        name: 'My collection',
        description: 'description',
        location: 'location1'
    };

    return shallow(<FilesPage
        fetchFilesIfNeeded={() => {}}
        openedPath={openedPath}
        openedCollection={openedCollection}
        history={history}
        selectCollection={() => {}}
        fetchCollectionsIfNeeded={() => {}}
    />);
}

describe('FilesPage', () => {
    it('updates url after collection location has changed', () => {
        const history = [];
        const wrapper = shallowRender(history, 'location1/subdirectory/something-else');

        const collectionChangeHandler = wrapper.find(InformationDrawer).prop("onCollectionLocationChange");
        collectionChangeHandler('new-location');

        expect(history.length).toEqual(1);
        expect(history[0]).toEqual('/collections/new-location/subdirectory/something-else');
    });

    it('can handle an empty openedPath', () => {
        const history = [];
        const wrapper = shallowRender(history, 'location1');

        const collectionChangeHandler = wrapper.find(InformationDrawer).prop("onCollectionLocationChange");
        collectionChangeHandler('new-location');

        expect(history.length).toEqual(1);
        expect(history[0]).toEqual('/collections/new-location/');
    });
});
