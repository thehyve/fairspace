import React from 'react';
import {shallow} from "enzyme";

import {FilesPage} from "../FilesPage";
import InformationDrawer from "../../common/components/InformationDrawer";

const collections = [
    {
        name: 'My collection',
        description: 'description',
        location: 'location1'
    }
];

function shallowRender(history, openedPath) {
    return shallow(
        <FilesPage
            match={{
                params: {
                    collection: 'location1',
                    path: openedPath
                }
            }}
            history={history}
            selectCollection={() => {}}
            collections={collections}
        />
    );
}

describe('FilesPage', () => {
    it('updates url after collection location has changed', () => {
        const history = [];
        const wrapper = shallowRender(history, 'subdirectory/something-else');

        const collectionChangeHandler = wrapper.find(InformationDrawer).prop("onCollectionLocationChange");
        collectionChangeHandler('new-location');

        expect(history.length).toEqual(1);
        expect(history[0]).toEqual('/collections/new-location/subdirectory/something-else');
    });

    it('can handle an empty openedPath', () => {
        const history = [];
        const wrapper = shallowRender(history, '');

        const collectionChangeHandler = wrapper.find(InformationDrawer).prop("onCollectionLocationChange");
        collectionChangeHandler('new-location');

        expect(history.length).toEqual(1);
        expect(history[0]).toEqual('/collections/new-location/');
    });
});
