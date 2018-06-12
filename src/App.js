import React from 'react';
import {Admin, fetchUtils, Resource} from 'react-admin';
import loginPage from './pages/loginpage'
import Dashboard from './pages/dashboard'

import authenticationProvider from './auth/oauth-provider'
import springDataprovider from './data/spring-dataprovider';

import {WorkspaceCreate, WorkspaceEdit, WorkspaceList} from './pages/workspaces';

export default class App extends React.Component {
    constructor(props, context) {
        super(props, context);

        // Ensure the authentication token is added to the httpClient
        const httpClient = (url, options = {}) => {
            options.credentials = 'include';
            return fetchUtils.fetchJson(url, options);
        }

        this.dataProvider = springDataprovider('http://localhost:8080', httpClient);
        this.authenticationProvider = authenticationProvider('http://localhost:8080')
    }

    render() {
        return (<Admin
            loginPage={loginPage}
            dataProvider={this.dataProvider}
            authProvider={this.authenticationProvider}
            dashboard={Dashboard}>
            <Resource name="workspaces" options={{ label: 'Example'}} list={WorkspaceList} edit={WorkspaceEdit} create={WorkspaceCreate}/>
        </Admin>)
    }

}