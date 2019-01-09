import React from 'react';
import {Route, withRouter} from "react-router-dom";
import {connect} from 'react-redux';
import Home from "../../pages/Home/Home";
import Collections from "../../pages/Collections/Collections";
import Notebooks from "../../pages/Notebooks/Notebooks";
import MetadataEntityPage from "../../pages/Metadata/MetadataEntityPage";
import MetadataOverviewPage from "../../pages/Metadata/MetadataOverviewPage";
import Files from "../../pages/Files/Files";
import logout from "../../services/Logout/logout";

const routes = ({menuExpanded}) => (
    <div style={{marginLeft: menuExpanded ? 230 : 60}}>
        <Route path="/" exact component={Home} />
        <Route path="/collections" exact component={Collections} />
        <Route path="/collections/:collection/:path(.*)?" component={Files} />
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
