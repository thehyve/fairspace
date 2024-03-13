import React from 'react';
import {createRoot} from 'react-dom/client';
import App from '../App';
import {LocalFileAPI} from '../file/FileAPI';

beforeEach(() => {
    const getDirectoryContents = jest.fn(() => Promise.resolve(
        {data: []}
    ));
    LocalFileAPI.client = () => ({getDirectoryContents});
});

// eslint-disable-next-line jest/expect-expect
it('renders without crashing', () => {
    const div = document.createElement('div');
    const root = createRoot(div);
    root.render(<App />);
    root.unmount();
});
