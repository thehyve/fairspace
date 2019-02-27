import React from 'react';
import {shallow} from "enzyme";
import {InformationDrawer} from "./InformationDrawer";

describe('InformationDrawer', () => {
    const updateCollection = jest.fn(() => Promise.resolve());
    const invalidateMetadata = jest.fn();
    const fetchCombinedMetadataIfNeeded = jest.fn();

    let collection;
    let handleCollectionLocationChange;
    let wrapper;

    beforeEach(() => {
        collection = {
            name: 'My collection',
            description: 'description',
            location: 'location1'
        };

        handleCollectionLocationChange = jest.fn();
    });

    it('invokes callback method after collection location has changed', () => {
        wrapper = shallow(<InformationDrawer
            collection={collection}
            updateCollection={updateCollection}
            invalidateMetadata={invalidateMetadata}
            fetchCombinedMetadataIfNeeded={fetchCombinedMetadataIfNeeded}
            onCollectionLocationChange={handleCollectionLocationChange}
            paths={[]}
        />);

        return wrapper.instance()
            .handleUpdateCollection('My collection', 'description', 'newlocation')
            .then(() => {
                expect(handleCollectionLocationChange.mock.calls.length).toEqual(1);
                expect(handleCollectionLocationChange.mock.calls[0][0].location).toEqual('newlocation');
            });
    });

    it('does not invoke callback method if collection location has not changed', () => {
        wrapper = shallow(<InformationDrawer
            collection={collection}
            updateCollection={updateCollection}
            invalidateMetadata={invalidateMetadata}
            fetchCombinedMetadataIfNeeded={fetchCombinedMetadataIfNeeded}
            onCollectionLocationChange={handleCollectionLocationChange}
            paths={[]}
        />);

        return wrapper.instance()
            .handleUpdateCollection('Other name', 'Other description', 'location1')
            .then(() => {
                expect(handleCollectionLocationChange.mock.calls.length).toEqual(0);
            });
    });

    it('ignores a missing callback function when a collection location has changed', () => {
        wrapper = shallow(<InformationDrawer
            collection={collection}
            updateCollection={updateCollection}
            invalidateMetadata={invalidateMetadata}
            fetchCombinedMetadataIfNeeded={fetchCombinedMetadataIfNeeded}
            paths={[]}
        />);

        // Verify that updating a collection without callback
        // does not throw an error
        return wrapper.instance()
            .handleDetailsChange(collection, true);
    });
});
