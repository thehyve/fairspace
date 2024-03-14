import React from 'react';
import {Redirect, Route, Switch} from 'react-router-dom';

import WorkspaceLayout from '../layout/WorkspaceLayout';
import logout from './logout';

const GlobalRoutes = () => (
    <Switch>
        <Route
            path="/login"
            render={() => {
                const redirectUrl = new URLSearchParams(window.location.search).get('redirectUrl');
                if (redirectUrl && redirectUrl.startsWith(window.location.origin)) {
                    window.location.href = redirectUrl;
                } else {
                    window.location.href = window.location.origin;
                }
            }}
        />

        <Route path="/logout" render={() => logout()} />

        <Route path="/" component={WorkspaceLayout} />

        <Redirect to="/workspaces" />
    </Switch>
);

export default GlobalRoutes;
