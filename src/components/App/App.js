import React from 'react';
import PropTypes from 'prop-types';
import Typography from '@material-ui/core/Typography';
import {withStyles} from '@material-ui/core/styles';
import TopBar from "../TopBar/TopBar";
import MenuDrawer from "../MenuDrawer/MenuDrawer";
import './App.css';
import styles from './App.styles';

function App(props) {
    const {classes} = props;
    return (
        <div className={classes.root}>
            <TopBar classes={classes}></TopBar>
            <MenuDrawer classes={classes}></MenuDrawer>
            <main className={classes.content}>
                <div className={classes.toolbar}/>
                <Typography noWrap>{'You think water moves fast? You should see ice.'}</Typography>
            </main>
        </div>
    );
}

App.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(App);
