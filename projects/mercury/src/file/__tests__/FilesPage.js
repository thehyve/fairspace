import React from 'react';
import {shallow} from "enzyme";
import {act} from 'react-dom/test-utils';
import {act} from 'react-dom/test-utils';

import {FilesPage} from "../FilesPage";
import InformationDrawer from "../../common/components/InformationDrawer";
import {UploadsProvider} from "../../common/contexts/UploadsContext";

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
        const fileApi = {
            list: () => Promise.resolve([])
        };

        // Awaiting the render is needed because some of the state updates
        // only happen after an asynchronous call. See https://github.com/facebook/react/issues/15379
        await act(async () => {
                        <UploadsProvider>
                                fileApi={fileApi}
                        </UploadsProvider>
        });

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
