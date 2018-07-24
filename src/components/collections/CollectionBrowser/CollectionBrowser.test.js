import React from 'react';
import ReactDOM from 'react-dom';
import CollectionBrowser from "./CollectionBrowser";
import InformationDrawer from "../InformationDrawer/InformationDrawer";
import {shallow, mount} from "enzyme";
import Button from "@material-ui/core/Button";
import Config from "../../generic/Config/Config";
import configFile from "../../../config";

beforeAll(() => {
    Config.setConfig(Object.assign(configFile, {
        "externalConfigurationFiles": [],
        "user": {
            "username": "John"
        }
    }));

    return Config.init();
});


let mockS3, mockMetadataStore;

function flushPromises() {
    return new Promise(resolve => setImmediate(resolve));
}

beforeEach(() => {
    mockS3 = {
        listBuckets: jest.fn(cb  => cb(null, { Buckets: [] })),
        createBucket: jest.fn((options, cb)  => cb())
    }
    mockMetadataStore = {
        addCollectionMetadata: jest.fn(() => Promise.resolve()),
        getCollectionMetadata: jest.fn(() => Promise.resolve([])),
        updateCollectionMetadata: jest.fn(() => Promise.resolve([])),
    }

});

it('renders without crashing', () => {
    const div = document.createElement('div');
    ReactDOM.render(<CollectionBrowser s3={mockS3} metadataStore={mockMetadataStore}/>, div);
    ReactDOM.unmountComponentAtNode(div);
});

it('calls the s3 listBuckets API on load', () => {
    const wrapper = shallow(<CollectionBrowser s3={mockS3} metadataStore={mockMetadataStore} />);

    expect(mockS3.listBuckets.mock.calls.length).toEqual(1);
});

it('creates a new collection on button click', () => {
    const wrapper = mount(<CollectionBrowser s3={mockS3} metadataStore={mockMetadataStore} />);

    // Setup proper state
    wrapper.setState({loading: false});
    let button = wrapper.find(Button);
    expect(button.length).toEqual(1);

    // Click on button
    button.simulate('click');

    // Expect the collection to be created in storage
    expect(mockS3.createBucket.mock.calls.length).toEqual(1);

    // Expect the collection metadata to be stored
    expect(mockMetadataStore.addCollectionMetadata.mock.calls.length).toEqual(1);
});


it('reloads the collection list on succesful creation', () => {
    const wrapper = shallow(<CollectionBrowser s3={mockS3} metadataStore={mockMetadataStore} />);
    expect(mockS3.listBuckets.mock.calls.length).toEqual(1);

    // Setup proper state
    wrapper.setState({loading: false});
    let button = wrapper.find(Button);
    expect(button.length).toEqual(1);

    button.simulate('click');

    return flushPromises().then(() =>{
        expect(mockS3.listBuckets.mock.calls.length).toEqual(2);
    });
});

it('reloads the collection list on succesful update', () => {
    const wrapper = shallow(<CollectionBrowser s3={mockS3} metadataStore={mockMetadataStore} />);
    expect(mockS3.listBuckets.mock.calls.length).toEqual(1);

    // Setup proper state
    wrapper.setState({loading: false});
    wrapper.find(InformationDrawer).get(0).props.onChangeDetails(1, {});

    return flushPromises().then(() =>{
        expect(mockS3.listBuckets.mock.calls.length).toEqual(2);
    });
});


it('does not store metadata is bucket creation fails', () => {
    mockS3.createBucket = jest.fn((options, cb)  => cb("Error"));
    const wrapper = shallow(<CollectionBrowser s3={mockS3} metadataStore={mockMetadataStore} />);

    // Setup proper state
    wrapper.setState({loading: false});
    let button = wrapper.find(Button);
    expect(button.length).toEqual(1);

    button.simulate('click');

    return flushPromises().then(() => {
        // Expect the collection to be created in storage
        expect(mockS3.createBucket.mock.calls.length).toEqual(1);

        // Expect the collection metadata not to be stored
        expect(mockMetadataStore.addCollectionMetadata.mock.calls.length).toEqual(0);

        // Expect the list not to be reloaded
        expect(mockS3.listBuckets.mock.calls.length).toEqual(1);
    });
});

it('does reload the collection list if storing metadata fails', () => {
    mockMetadataStore.addCollectionMetadata = jest.fn(() => Promise.reject());

    const wrapper = shallow(<CollectionBrowser s3={mockS3} metadataStore={mockMetadataStore} />);
    expect(mockS3.listBuckets.mock.calls.length).toEqual(1);

    wrapper.setState({loading: false});

    let button = wrapper.find(Button);
    expect(button.length).toEqual(1);
    button.simulate('click');

    return flushPromises().then(() => {
        expect(mockS3.listBuckets.mock.calls.length).toEqual(2);
    });
});
