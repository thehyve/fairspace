import React from 'react';
import ReactDOM from 'react-dom';
import App from '../App';
import FileAPI from '../file/FileAPI';

beforeAll(() => {
    window.localStorage = {
        getItem: jest.fn(() => null),
        setItem: jest.fn()
    };
    const getDirectoryContents = jest.fn(() => Promise.resolve(
        {data: []}
    ));
    FileAPI.client = () => ({getDirectoryContents});
});

// eslint-disable-next-line jest/expect-expect
it('renders without crashing', () => {
    const div = document.createElement('div');
    ReactDOM.render(<App />, div);
    ReactDOM.unmountComponentAtNode(div);
});
