import React from 'react';
import {Route, withRouter} from "react-router-dom";
import {connect} from 'react-redux';
import Home from "./Home";
import Collections from "./collections/CollectionsPage";
import Notebooks from "./Notebooks";
import MetadataEntityPage from "./metadata/MetadataEntityPage";
import MetadataOverviewPage from "./metadata/MetadataOverviewPage";
import FilesPage from "./file/FilesPage";
import logout from "../services/Logout/logout";

const routes = ({menuExpanded}) => (
    <div style={{marginLeft: menuExpanded ? 230 : 60}}>
        <Route path="/" exact component={Home} />
        <Route path="/collections" exact component={Collections} />
        <Route path="/collections/:collection/:path(.*)?" component={FilesPage} />
        <Route path="/notebooks" exact component={Notebooks} />
        <Route path="/metadata" exact component={MetadataOverviewPage} />
        <Route path="/iri/**" component={MetadataEntityPage} />
        <Route path="/login" render={() => {window.location.href = '/login';}} />
        <Route path="/logout" render={logout} />
    </div>
);

const mapStateToProps = state => ({
    menuExpanded: state.ui.menuExpanded
});

export default withRouter(connect(mapStateToProps)(routes));
