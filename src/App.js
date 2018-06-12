import React from 'react';
import {Admin, fetchUtils, Resource} from 'react-admin';
import springDataprovider from './spring-dataprovider';
import loginPage from './loginpage'

import {WorkspaceCreate, WorkspaceEdit, WorkspaceList} from './workspaces';

export default class App extends React.Component {
    constructor(props, context) {
        super(props, context);
        this.authenticationAdapter = props.authenticationAdapter;
        this.state = {initialized: false}

        // Ensure the authentication token is added to the httpClient
        const httpClient = (url, options = {}) => {
            if (!options.headers) {
                options.headers = new Headers({Accept: 'application/json'});
            }

            const token = this.authenticationAdapter.getToken();
            console.log("Add token to request", token);
            options.headers.set('Authorization', `Bearer ${token}`);
            return fetchUtils.fetchJson(url, options);
        }

        this.dataProvider = springDataprovider('http://localhost:8080', httpClient);
    }

    componentDidMount() {
        // Initialize authenticationadapter
        this.authenticationAdapter.init()
            .then(() => {
                this.setState({initialized: true});
            });
    }

    render() {
        if (this.state.initialized) {
            return (<Admin
                loginPage={loginPage}
                dataProvider={this.dataProvider}
                authProvider={this.authenticationAdapter.createAuthProvider()}>
                <Resource name="workspaces" list={WorkspaceList} edit={WorkspaceEdit} create={WorkspaceCreate}/>
            </Admin>)
        } else {
            return (<span>Loading...</span>)
        }
    }

}