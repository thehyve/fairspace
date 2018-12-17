import React from 'react';
import classNames from 'classnames';
import Drawer from "@material-ui/core/Drawer";
import Divider from "@material-ui/core/Divider";
import {withStyles} from '@material-ui/core/styles';
import IconButton from '@material-ui/core/IconButton';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import {compose} from "redux";
import {connect} from "react-redux";
import {toggleMenuExpansion} from "../../../actions/ui";
import Menu from "./Menu";
import styles from "./MenuDrawer.styles";

const MenuDrawer = ({open, toggleMenuExpansion, classes}) => (
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
        <Menu />
    </Drawer>
);

const mapStateToProps = state => ({
    open: state.ui.menuExpanded
});

const mapDispatchToProps = {
    toggleMenuExpansion
};

export default compose(withStyles(styles), connect(mapStateToProps, mapDispatchToProps))(MenuDrawer);
