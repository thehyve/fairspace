import React from 'react';
import ReactDOM from 'react-dom';
import CollectionList from "./CollectionList";

let mockS3;

beforeEach(() => {
    mockS3 = {
        listBuckets: jest.fn()
    }
});

it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(<CollectionList s3={mockS3} />, div);
  ReactDOM.unmountComponentAtNode(div);
});

it('calls the s3 listBuckets API', () => {
    const div = document.createElement('div');
    ReactDOM.render(<CollectionList s3={mockS3} />, div);

    expect(mockS3.listBuckets.mock.calls.length).toEqual(1);
});
