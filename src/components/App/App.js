import React from 'react';
import PropTypes from 'prop-types';
import {withStyles} from '@material-ui/core/styles';
import './App.css';
import styles from './App.styles';
import TopBar from "../layout/TopBar/TopBar";
import MenuDrawer from "../layout/MenuDrawer/MenuDrawer";
import AuthorizationCheck from "../generic/AuthorizationCheck/AuthorizationCheck";
import Config from "../generic/Config/Config";

import {BrowserRouter as Router, Route} from "react-router-dom";
import Home from "../../pages/Home/Home";
import Collections from "../../pages/Collections/Collections";
import Notebooks from "../../pages/Notebooks/Notebooks";
import Metadata from "../../pages/Metadata/Metadata";

class App extends React.Component {
    cancellable = {
        // it's important that this is one level down, so we can drop the
        // reference to the entire object by setting it to undefined.
        setState: this.setState.bind(this)
    };

    constructor(props) {
        super(props);
        this.classes = props.classes;

        this.state = {configLoaded: false};
    }

    componentDidMount() {
        // Wait for the configuration to be loaded
        Config.init()
            .then(() =>
                this.cancellable.setState && this.cancellable.setState({configLoaded: true})
            );
    }

    componentWillUnmount() {
        this.cancellable.setState = undefined;
    }

    // If an error is to be shown, it should be underneath the
    // AppBar. This method take care of it
    transformError(errorContent) {
        return (<main className={this.classes.content}>
            <div className={this.classes.toolbar}/>
            {errorContent}
        </main>)
    }

    render() {
        if(this.state.configLoaded) {
            // The app itself consists of a topbar, a drawer and the actual page
            // The topbar is shown even if the user has no proper authorization
            return (
                <div className={this.classes.root}>
                    <TopBar classes={this.classes}></TopBar>
                    <Router>
                        <AuthorizationCheck transformError={this.transformError.bind(this)}>
                            <MenuDrawer classes={this.classes}></MenuDrawer>
                            <main className={this.classes.content}>
                                <div className={this.classes.toolbar}/>

                                <Route exact path="/" component={Home}/>
                                <Route path="/collections/:collection?/:path(.*)?" component={Collections}/>
                                <Route path="/notebooks" component={Notebooks}/>
                                <Route path="/metadata/:type(projects|patients|samples|consents)/:id" component={Metadata}/>

                                {/* Handle auth urls that should go to the server */}
                                <Route path="/login" render={() => {window.location.href = '/login';}}/>
                                <Route path="/logout" render={() => {window.location.href = '/logout';}}/>
                            </main>
                        </AuthorizationCheck>
                    </Router>
                </div>
            );
        } else {
            return (<div>Loading...</div>);
        }
    }
}

App.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(App);
