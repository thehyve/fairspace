import React from 'react';
import classNames from 'classnames';
import {withRouter} from "react-router-dom";
import Drawer from "@material-ui/core/Drawer";
import Divider from "@material-ui/core/Divider";
import {withStyles} from '@material-ui/core/styles';
import IconButton from '@material-ui/core/IconButton';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import {compose} from "redux";
import {connect} from "react-redux";
import * as uiActions from "../../../../actions/uiActions";
import Menu from "./Menu";
import styles from "./MenuDrawer.styles";

const MenuDrawer = ({classes, open, toggleMenuExpansion, mouseEnteredMenu, mouseLeftMenu}) => (
    <Drawer
        variant="permanent"
        classes={{
            paper: classNames(classes.drawerPaper, !open ? classes.drawerPaperClose : classes.drawerPaperOpen),
        }}
    >
        <div className={classes.toolbar}>
            <IconButton onClick={toggleMenuExpansion}>
                {!open ? <ChevronRightIcon /> : <ChevronLeftIcon />}
            </IconButton>
        </div>
        <Divider />
        <div
            onMouseEnter={mouseEnteredMenu}
            onMouseLeave={mouseLeftMenu}
        >
            <Menu />
        </div>
    </Drawer>
);

const mapStateToProps = state => ({
    open: state.ui.menuExpanded || state.ui.mouseEnteredMenu
});

const mapDispatchToProps = {
    ...uiActions
};

export default withRouter(compose(withStyles(styles), connect(mapStateToProps, mapDispatchToProps))(MenuDrawer));
