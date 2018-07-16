import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import Config from "../Config/Config";

beforeAll(() => {
    Config.setConfig({
        "externalConfigurationFiles": []
    });

    return Config.init();
});

it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(<App />, div);
  ReactDOM.unmountComponentAtNode(div);
});
