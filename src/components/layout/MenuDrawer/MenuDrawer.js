import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import Drawer from "@material-ui/core/Drawer";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import Divider from "@material-ui/core/Divider";
import Icon from "@material-ui/core/Icon";
import {Link} from "react-router-dom";
import Config from "../../generic/Config/Config";
import {withStyles} from '@material-ui/core/styles';
import IconButton from '@material-ui/core/IconButton';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';

const drawerWidth = 240;

const styles = theme => ({
    root: {
        flexGrow: 1,
        height: 440,
        zIndex: 1,
        overflow: 'hidden',
        position: 'relative',
        display: 'flex',
    },
    appBar: {
        zIndex: theme.zIndex.drawer + 1,
        transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
        }),
    },
    appBarShift: {
        marginLeft: drawerWidth,
        width: `calc(100% - ${drawerWidth}px)`,
        transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
        }),
    },
    menuButton: {
        marginLeft: 12,
        marginRight: 36,
    },
    hide: {
        display: 'none',
    },
    drawerPaper: {
        position: 'relative',
        whiteSpace: 'nowrap',
        width: drawerWidth,
        height: '100vh',
        transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
        }),
    },
    drawerPaperClose: {
        overflowX: 'hidden',
        transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
        }),
        width: theme.spacing.unit * 7,
        [theme.breakpoints.up('sm')]: {
            width: theme.spacing.unit * 9,
        },
    },
    toolbar: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        padding: '0 8px',
        ...theme.mixins.toolbar,
    },
    content: {
        flexGrow: 1,
        backgroundColor: theme.palette.background.default,
        padding: theme.spacing.unit * 3,
    },
});

class MenuDrawer extends React.Component {
    state = {
        open: true,
    };

    handleDrawerOpen = () => {
        this.setState({open: true});
    };

    handleDrawerClose = () => {
        this.setState({open: false});
    };

    render() {
        const {classes, theme} = this.props;
        return (
            <Drawer
                variant="permanent"
                classes={{
                    paper: classNames(classes.drawerPaper, !this.state.open && classes.drawerPaperClose),
                }}
            >
                <div className={classes.toolbar}>
                    <IconButton onClick={this.handleDrawerClose}>
                        {theme.direction === 'rtl' ? <ChevronRightIcon/> : <ChevronLeftIcon/>}
                    </IconButton>
                </div>
                <div>
                    <List>
                        <ListItem component={Link} to="/" button>
                            <ListItemIcon>
                                <Icon>home</Icon>
                            </ListItemIcon>
                            <ListItemText primary="Home"/>
                        </ListItem>
                        <ListItem component={Link} to="/collections" button>
                            <ListItemIcon>
                                <Icon>folder_open</Icon>
                            </ListItemIcon>
                            <ListItemText primary="Collections"/>
                        </ListItem>
                        <ListItem component={Link} to={"/notebooks"} button>
                            <ListItemIcon>
                                <Icon>bar_chart</Icon>
                            </ListItemIcon>
                            <ListItemText primary="Notebooks"/>
                        </ListItem>
                        <ListItem button>
                            <ListItemIcon>
                                <Icon>transform</Icon>
                            </ListItemIcon>
                            <ListItemText primary="Workflows"/>
                        </ListItem>
                        <ListItem component={Link} to="/metadata" button>
                            <ListItemIcon>
                                <Icon>assignment</Icon>
                            </ListItemIcon>
                            <ListItemText primary="Metadata"/>
                        </ListItem>
                    </List>
                    <Divider/>
                    <List>
                        <ListItem button>
                            <ListItemIcon>
                                <Icon>share</Icon>
                            </ListItemIcon>
                            <ListItemText primary="Dataverse"/>
                        </ListItem>
                        <ListItem button>
                            <ListItemIcon>
                                <Icon>public</Icon>
                            </ListItemIcon>
                            <ListItemText primary="cBioportal"/>
                        </ListItem>
                    </List>
                </div>
            </Drawer>
        );
    }
}

MenuDrawer.propTypes = {
    classes: PropTypes.object.isRequired,
    theme: PropTypes.object.isRequired,
};

export default withStyles(styles, {withTheme: true})(MenuDrawer);


