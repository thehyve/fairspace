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

const routes = (props) => (
    <div style={{marginLeft: props.menuExpanded ? 230 : 60}}>
        <React.Fragment>
            <Route exact path="/" component={Home} />
            <Route exact path="/collections" component={Collections} />
            <Route path="/collections/:collection/:path(.*)?" component={Files} />
            <Route exact path="/notebooks" component={Notebooks} />

            <Route exact path="/metadata" component={MetadataOverviewPage} />
            <Route
                path="/iri/**"
                component={MetadataEntityPage}
            />

            {/* Handle auth urls that should go to the server */}
            <Route
                path="/login"
                render={() => {
                    window.location.href = '/login';
                }}
            />
            <Route path="/logout" render={logout} />
        </React.Fragment>
    </div>
);

const mapStateToProps = state => ({
    menuExpanded: state.ui.menuExpanded
});

export default withRouter(connect(mapStateToProps)(routes));
