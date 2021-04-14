import React from 'react';
import ReactDOM from 'react-dom';
import App from '../App';
import {LocalFileAPI} from "../file/FileAPI";

beforeAll(() => {
    window.localStorage = {
        getItem: jest.fn(() => null),
        setItem: jest.fn()
    };
    const getDirectoryContents = jest.fn(() => Promise.resolve(
        {data: []}
    ));
    LocalFileAPI.client = () => ({getDirectoryContents});
});

// eslint-disable-next-line jest/expect-expect
it('renders without crashing', () => {
    const div = document.createElement('div');
    ReactDOM.render(<App />, div);
    ReactDOM.unmountComponentAtNode(div);
});
