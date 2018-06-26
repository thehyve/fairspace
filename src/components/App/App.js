import React from 'react';
import PropTypes from 'prop-types';
import Typography from '@material-ui/core/Typography';
import {withStyles} from '@material-ui/core/styles';
import './App.css';
import styles from './App.styles';
import TopBar from "../TopBar/TopBar";
import MenuDrawer from "../MenuDrawer/MenuDrawer";
import AuthorizationCheck from "../AuthorizationCheck/AuthorizationCheck";

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
            <AuthorizationCheck transformError={transformError}>
                <MenuDrawer classes={classes}></MenuDrawer>
                <main className={classes.content}>
                    <div className={classes.toolbar}/>
                    <Typography noWrap>{'You think water moves fast? You should see ice.'}</Typography>
                </main>
            </AuthorizationCheck>
        </div>
    );
}

App.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(App);
