import React from 'react';
import {Route} from "react-router-dom";

import Home from "./Home";
import Collections from "./collections/CollectionsPage";
import Notebooks from "./Notebooks";
import MetadataEntityPage from "./metadata/MetadataEntityPage";
import MetadataOverviewPage from "./metadata/MetadataOverviewPage";
import FilesPage from "./file/FilesPage";
import logout from "../services/logout";
import SearchPage from './search/SearchPage';

const routes = () => (
    <>
        <Route path="/" exact component={Home} />
        <Route path="/collections" exact component={Collections} />
        <Route path="/collections/:collection/:path(.*)?" component={FilesPage} />
        <Route path="/notebooks" exact component={Notebooks} />
        <Route path="/metadata" exact component={MetadataOverviewPage} />
        <Route path="/iri/**" component={MetadataEntityPage} />
        <Route path="/login" render={() => {window.location.href = '/login';}} />
        <Route path="/logout" render={logout} />
        <Route path="/search" component={SearchPage} />
    </>
);

export default routes;
