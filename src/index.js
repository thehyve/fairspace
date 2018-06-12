import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import registerServiceWorker from './registerServiceWorker';
import KeycloakAdapter from "./keycloak/adapter";

const keycloakAdapter = new KeycloakAdapter();

ReactDOM.render(<App authenticationAdapter={keycloakAdapter}/>, document.getElementById('root'));

registerServiceWorker();
