import React from 'react';
import {Redirect, Route, Switch} from "react-router-dom";
import {logout} from '../common';

import WorkspaceLayout from '../layout/WorkspaceLayout';

const GlobalRoutes = () => (
    <Switch>
        <Route
            path="/login"
            render={() => {
                window.location.href = new URLSearchParams(window.location.search).get('redirectUrl');
            }}
        />

        <Route
            path="/logout"
            render={() => logout()}
        />

        <Route
            path="/"
            component={WorkspaceLayout}
        />

        <Redirect to="/workspaces" />
    </Switch>
);

export default GlobalRoutes;
