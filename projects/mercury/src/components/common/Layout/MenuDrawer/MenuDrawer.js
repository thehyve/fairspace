import React from 'react';
import classNames from 'classnames';
import {Drawer, Divider, IconButton} from "@material-ui/core";
import {withStyles} from '@material-ui/core/styles';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';

import Menu from "./Menu";
import styles from "./MenuDrawer.styles";

const MenuDrawer = ({open, toggleMenuExpansion, onMouseEnter, onMouseLeave, classes}) => (
    <Drawer
        variant="permanent"
        classes={{
            paper: classNames(classes.drawerPaper, open ? classes.drawerPaperOpen : classes.drawerPaperClose),
        }}
    >
        <div className={classes.toolbar}>
            <IconButton onClick={toggleMenuExpansion}>
                {open ? <ChevronLeftIcon /> : <ChevronRightIcon />}
            </IconButton>
        </div>
        <Divider />
        <div
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
        >
            <Menu />
        </div>
    </Drawer>
);

export default withStyles(styles)(MenuDrawer);
