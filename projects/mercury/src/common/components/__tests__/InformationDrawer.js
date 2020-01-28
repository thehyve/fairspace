/* eslint-disable react/jsx-props-no-spreading */
import React from 'react';
import {shallow} from "enzyme";

import {InformationDrawer} from "../InformationDrawer";
import CollectionDetails from '../../../collections/CollectionDetails';

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
        classes: {},
        path: '/videos',
        atLeastSingleCollectionExists: true,
        loading: false
    };

    it('renders collection details for the selected collection', () => {
        const wrapper = shallow(<InformationDrawer
            {...defaultProps}
        />);

        const collectionDetailsProps = wrapper.find(CollectionDetails).first().props();
        expect(collectionDetailsProps.collection.location).toBe('location1');
    });
});
