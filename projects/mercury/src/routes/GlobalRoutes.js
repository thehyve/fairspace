import React from 'react';
import {Redirect, Route, Switch} from "react-router-dom";
import {logout} from '../common';

import ProjectListLayout from '../layout/ProjectListLayout';
import ProjectLayout from '../layout/ProjectLayout';

const GlobalRoutes = () => (
    <Switch>
        <Route
            path="/projects" exact
            component={ProjectListLayout}
        />

        <Route
            path="/projects/:project"
            component={ProjectLayout}
        />

        <Route path="/login" render={() => {window.location.href = '/login';}} />

        <Route
            path="/logout"
            render={() => logout()}
        />

        <Redirect to="/projects" />
    </Switch>
);

export default GlobalRoutes;
