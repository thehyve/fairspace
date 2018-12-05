import React from 'react';
import Config from '../../../services/Config/Config';
import styles from "./Menu.styles";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import Divider from "@material-ui/core/Divider";
import Icon from "@material-ui/core/Icon";
import {NavLink} from "react-router-dom";
import {withStyles} from '@material-ui/core/styles';

const Menu = ({classes}) => (
    <div>
        <List className={classes.menuItemList}>
            <ListItem component={NavLink} exact to="/" button>
                <ListItemIcon>
                    <Icon>home</Icon>
                </ListItemIcon>
                <ListItemText primary="Home"/>
            </ListItem>
            <ListItem component={NavLink} to="/collections" button>
                <ListItemIcon>
                    <Icon>folder_open</Icon>
                </ListItemIcon>
                <ListItemText primary="Collections"/>
            </ListItem>
            <ListItem component={NavLink} to={"/notebooks"} button>
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
            <ListItem component={NavLink} to="/metadata" button>
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
            <ListItem component='a' href={Config.get().urls.cbioportal} Button>
                <ListItemIcon>
                    <Icon>public</Icon>
                </ListItemIcon>
                <ListItemText primary="cBioportal" />
            </ListItem>
        </List>
    </div>
)

export default withStyles(styles)(Menu);


