import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import styles from "./MenuDrawer.styles";
import Drawer from "@material-ui/core/Drawer";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import Divider from "@material-ui/core/Divider";
import Icon from "@material-ui/core/Icon";
import {Link} from "react-router-dom";
import {withStyles} from '@material-ui/core/styles';
import IconButton from '@material-ui/core/IconButton';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';

class MenuDrawer extends React.Component {

    state = {
        open: false,
    };

    toggleDrawer = () => {
        this.setState({open: !this.state.open});
    };

    render() {
        const {classes} = this.props;
        const {open} = this.state;
        return (
            <Drawer
                variant="permanent"
                classes={{
                    paper: classNames(classes.drawerPaper, !open ? classes.drawerPaperClose : classes.drawerPaperOpen),
                }}
            >
                <div className={classes.toolbar}>
                    <IconButton onClick={this.toggleDrawer}>
                        {!open ? <ChevronRightIcon/> : <ChevronLeftIcon/>}
                    </IconButton>
                </div>
                <Divider/>
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

export default withStyles(styles, {withTheme: true})(MenuDrawer);


