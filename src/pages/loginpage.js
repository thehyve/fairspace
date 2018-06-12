import React, { Component } from 'react';
import { connect } from 'react-redux';
import { userLogin } from 'react-admin';

class MyLoginPage extends Component {
    submit = (e) => {
        e.preventDefault();

        //location.href = "http://localhost:9080/auth/realms/jhipster/protocol/openid-connect/auth?client_id=web_app&response_type=token+id_token&scope=openid&redirect_uri=http%3A%2F%2Flocalhost%3A8080&nonce=12345667"

        // gather your data/credentials here
        const credentials = { };

        // Dispatch the userLogin action (injected by connect)
        this.props.userLogin(credentials);
    }

    render() {
        return (
            <form onSubmit={this.submit}>
                <button>Login using keycloak</button>
            </form>
        );
    }
};

export default connect(undefined, { userLogin })(MyLoginPage);