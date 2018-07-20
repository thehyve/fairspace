import React from 'react';
import ReactDOM from 'react-dom';
import CollectionBrowser from "./CollectionBrowser";
import {shallow} from "enzyme";
import Button from "@material-ui/core/Button";

let mockS3;

beforeEach(() => {
    mockS3 = {
        listBuckets: jest.fn(cb  => cb(null, { Buckets: [] })),
        createBucket: jest.fn((options, cb)  => cb())
    }
});

it('renders without crashing', () => {
    const div = document.createElement('div');
    ReactDOM.render(<CollectionBrowser s3={mockS3}/>, div);
    ReactDOM.unmountComponentAtNode(div);
});

it('calls the s3 listBuckets API on load', () => {
    const wrapper = shallow(<CollectionBrowser s3={mockS3} />);

    expect(mockS3.listBuckets.mock.calls.length).toEqual(1);
});


it('create a new bucket on button click', () => {

    const wrapper = shallow(<CollectionBrowser s3={mockS3} />);
    expect(mockS3.listBuckets.mock.calls.length).toEqual(1);

    let button = wrapper.find(Button);
    expect(button.length).toEqual(1);
    button.simulate('click');

    expect(mockS3.createBucket.mock.calls.length).toEqual(1);
    expect(mockS3.listBuckets.mock.calls.length).toEqual(2);
});
