import React from 'react';
import {shallow} from "enzyme";
import {act} from 'react-dom/test-utils';

import {FilesPage} from "../FilesPage";
import InformationDrawer from "../../common/components/InformationDrawer";

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

    it('updates url after collection location has changed', () => {
        const history = [];

        act(() => {
            wrapper = shallowRender(history, 'subdirectory/something-else');
        });

        const collectionChangeHandler = wrapper.find(InformationDrawer).prop("onCollectionLocationChange");
        collectionChangeHandler('new-location');

        expect(history.length).toEqual(1);
        expect(history[0]).toEqual('/collections/new-location/subdirectory/something-else');
    });

    it('can handle an empty openedPath', () => {
        const history = [];

        act(() => {
            wrapper = shallowRender(history, '');
        });

        const collectionChangeHandler = wrapper.find(InformationDrawer).prop("onCollectionLocationChange");
        collectionChangeHandler('new-location');

        expect(history.length).toEqual(1);
        expect(history[0]).toEqual('/collections/new-location/');
    });
});
