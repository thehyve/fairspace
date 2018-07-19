import React from 'react';
import ReactDOM from 'react-dom';
import AuthorizationCheck from './AuthorizationCheck';
import Config from '../Config/Config';

beforeAll(() => {
    Config.setConfig({
        "externalConfigurationFiles": []
    });

    return Config.init();
});

it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(<AuthorizationCheck />, div);
  ReactDOM.unmountComponentAtNode(div);
});

it('renders content if no authorization is specified', () => {
    const check = new AuthorizationCheck({});
    expect(check.hasAuthorization([])).toEqual(true);
});

it('renders content if existing authorization is specified', () => {
    const check = new AuthorizationCheck({authorization: 'test-authorization'});
    expect(check.hasAuthorization(['test-authorization'])).toEqual(true);
});

it('does not render content if existing authorization is specified', () => {
    const check = new AuthorizationCheck({authorization: 'not-existing'});
    expect(check.hasAuthorization(['test-authorization'])).toEqual(false);
});
