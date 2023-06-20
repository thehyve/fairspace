// @ts-nocheck
/* eslint-disable react/jsx-props-no-spreading */
import React from "react";
import { configure, shallow } from "enzyme";
import Adapter from "@wojtekmaj/enzyme-adapter-react-17";
import { CollectionInformationDrawer } from "../CollectionInformationDrawer";
import CollectionDetails from "../CollectionDetails";
// Enzyme is obsolete, the Adapter allows running our old tests.
// For new tests use React Testing Library. Consider migrating enzyme tests when refactoring.
configure({
  adapter: new Adapter()
});
describe('CollectionInformationDrawer', () => {
  const collection = {
    name: 'My collection',
    description: 'description',
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
    const wrapper = shallow(<CollectionInformationDrawer {...defaultProps} />);
    const collectionDetailsProps = wrapper.find(CollectionDetails).first().props();
    expect(collectionDetailsProps.collection.name).toBe('My collection');
  });
});