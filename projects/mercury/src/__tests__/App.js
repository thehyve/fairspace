import React from 'react';
import ReactDOM from 'react-dom';
import App from '../App';
import Config from "../common/services/Config";
import configFile from "../config";

beforeAll(() => {
    window.localStorage = {
        getItem: jest.fn(() => null),
        setItem: jest.fn()
    };

    Config.setConfig(Object.assign(configFile, {
        externalConfigurationFiles: [],
    }));

    return Config.init();
});

it('renders without crashing', () => {
    const div = document.createElement('div');
    ReactDOM.render(<App />, div);
    ReactDOM.unmountComponentAtNode(div);
});
