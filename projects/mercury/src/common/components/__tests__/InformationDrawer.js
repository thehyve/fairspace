/* eslint-disable react/jsx-props-no-spreading */
import React from 'react';
import {shallow} from "enzyme";

import {InformationDrawer} from "../InformationDrawer";

describe('InformationDrawer', () => {
    const collection = {
        name: 'My collection',
        description: 'description',
        location: 'location1',
        iri: ''
    };

    const defaultProps = {
        collection,
        updateCollection: () => Promise.resolve(),
        paths: []
    };

    it('invokes callback method after collection location has changed', () => {
        const handleCollectionLocationChange = jest.fn();
        const wrapper = shallow(<InformationDrawer
            {...defaultProps}
            onCollectionLocationChange={handleCollectionLocationChange}
        />);

        return wrapper.instance()
            .handleUpdateCollection('My collection', 'description', 'newlocation')
            .then(() => {
                expect(handleCollectionLocationChange).toHaveBeenCalledTimes(1);
                expect(handleCollectionLocationChange).toHaveBeenCalledWith('newlocation');
            });
    });

    it('does not invoke callback method if collection location has not changed', () => {
        const handleCollectionLocationChange = jest.fn();
        const wrapper = shallow(<InformationDrawer
            {...defaultProps}
            onCollectionLocationChange={handleCollectionLocationChange}
        />);

        return wrapper.instance()
            .handleUpdateCollection('Other name', 'Other description', 'location1')
            .then(() => {
                expect(handleCollectionLocationChange).toHaveBeenCalledTimes(0);
            });
    });


    it('does not invoke callback method if collection update fails', () => {
        const handleCollectionLocationChange = jest.fn();
        const wrapper = shallow(<InformationDrawer
            {...defaultProps}
            updateCollection={() => Promise.reject()}
            onCollectionLocationChange={handleCollectionLocationChange}
        />);

        return wrapper.instance()
            .handleUpdateCollection('Other name', 'Other description', 'newlocation')
            .then(() => {
                expect(handleCollectionLocationChange).toHaveBeenCalledTimes(0);
            });
    });

    it('ignores a missing callback function when a collection location has changed', () => {
        const wrapper = shallow(<InformationDrawer
            {...defaultProps}
        />);

        // Verify that updating a collection without callback
        // does not throw an error
        return wrapper.instance()
            .handleDetailsChange(collection, true);
    });
});
