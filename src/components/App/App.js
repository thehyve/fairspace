import React from 'react';
import PropTypes from 'prop-types';
import {withStyles} from '@material-ui/core/styles';
import './App.css';
import styles from './App.styles';
import TopBar from "../TopBar/TopBar";
import MenuDrawer from "../MenuDrawer/MenuDrawer";
import AuthorizationCheck from "../AuthorizationCheck/AuthorizationCheck";
import {BrowserRouter as Router, Route} from "react-router-dom";
import Home from "../../pages/Home/Home";
import Files from "../../pages/Files/Files";
import Notebooks from "../../pages/Notebooks/Notebooks";

function App(props) {
    const {classes} = props;

    // If an error is to be shown, it should be underneath the
    // AppBar. This method take care of it
    const transformError = (errorContent) =>
            (<main className={classes.content}>
                <div className={classes.toolbar}/>
                {errorContent}
             </main>)

    // The app itself consists of a topbar, a drawer and the actual page
    // The topbar is shown even if the user has no proper authorization
    return (
        <div className={classes.root}>
            <TopBar classes={classes}></TopBar>
            <Router>
                <AuthorizationCheck transformError={transformError}>
                    <MenuDrawer classes={classes}></MenuDrawer>
                    <main className={classes.content}>
                        <div className={classes.toolbar}/>

                        <Route exact path="/" component={Home} />
                        <Route path="/files" component={Files} />
                        <Route path="/notebooks" component={Notebooks} />
                    </main>
                </AuthorizationCheck>
            </Router>
        </div>
    );
}

App.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(App);
