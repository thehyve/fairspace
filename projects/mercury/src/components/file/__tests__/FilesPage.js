import React from 'react';
import {shallow} from "enzyme";
import {FilesPage} from "../FilesPage";

describe('FilesPage', () => {
    describe('handling of changed collection location', () => {
        const selectCollection = jest.fn();
        const fetchCollectionsIfNeeded = jest.fn();
        const openedPath = 'location1/subdirectory/something-else';
        const openedCollection = {
            name: 'My collection',
            description: 'description',
            location: 'location1'
        };
        const newCollection = {
            name: 'My collection',
            description: 'description',
            location: 'new-location'
        };

        it('updates url after collection location has changed', () => {
            const history = [];
            const wrapper = shallow(<FilesPage
                fetchFilesIfNeeded={() => {}}
                openedPath={openedPath}
                openedCollection={openedCollection}
                history={history}
                selectCollection={selectCollection}
                fetchCollectionsIfNeeded={fetchCollectionsIfNeeded}
            />);

            wrapper.instance().handleCollectionLocationChange(newCollection);
            expect(history.length).toEqual(1);
            expect(history[0]).toEqual('/collections/new-location/subdirectory/something-else');
        });

        it('can handle an empty openedPath', () => {
            const history = [];
            const wrapper = shallow(<FilesPage
                fetchFilesIfNeeded={() => {}}
                openedPath="/location1"
                openedCollection={openedCollection}
                history={history}
                selectCollection={selectCollection}
                fetchCollectionsIfNeeded={fetchCollectionsIfNeeded}
            />);

            wrapper.instance().handleCollectionLocationChange(newCollection);
            expect(history.length).toEqual(1);
            expect(history[0]).toEqual('/collections/new-location/');
        });
    });
});
