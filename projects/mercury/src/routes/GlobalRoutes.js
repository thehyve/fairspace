import React from 'react';
import {Redirect, Route} from "react-router-dom";
import {logout} from '../common';

import ProjectListLayout from '../layout/ProjectListLayout';
import ProjectLayout from '../layout/ProjectLayout';

const GlobalRoutes = () => (
    <>
        <Redirect exact from="/" to="/projects" />
        <Route
            path="/projects"
            exact
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
    </>
);

export default GlobalRoutes;
