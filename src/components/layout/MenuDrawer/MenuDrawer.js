import React from 'react';
import Drawer from "@material-ui/core/Drawer";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import Divider from "@material-ui/core/Divider";
import Icon from "@material-ui/core/Icon";
import {Link} from "react-router-dom";

function MenuDrawer(props) {
    const { classes } = props;

    return (
        <Drawer
            variant="permanent"
            classes={{
                paper: classes.menuDrawerPaper,
            }}
        >
            <div className={classes.toolbar} />
            <div>
                <List>
                    <ListItem component={Link} to="/" button>
                        <ListItemIcon>
                            <Icon>home</Icon>
                        </ListItemIcon>
                        <ListItemText primary="Home" />
                    </ListItem>
                    <ListItem component={Link} to="/collections" button>
                        <ListItemIcon>
                            <Icon>folder_open</Icon>
                        </ListItemIcon>
                        <ListItemText primary="Collections" />
                    </ListItem>
                    <ListItem component={Link} to={"/notebooks"} button>
                        <ListItemIcon>
                            <Icon>bar_chart</Icon>
                        </ListItemIcon>
                        <ListItemText primary="Notebooks" />
                    </ListItem>
                    <ListItem button>
                        <ListItemIcon>
                            <Icon>transform</Icon>
                        </ListItemIcon>
                        <ListItemText primary="Workflows" />
                    </ListItem>
                    <ListItem component={Link} to="/metadata" button>
                        <ListItemIcon>
                            <Icon>assignment</Icon>
                        </ListItemIcon>
                        <ListItemText primary="Metadata" />
                    </ListItem>
                </List>
                <Divider />
                <List>
                    <ListItem button>
                        <ListItemIcon>
                            <Icon>share</Icon>
                        </ListItemIcon>
                        <ListItemText primary="Dataverse" />
                    </ListItem>
                    <ListItem button>
                        <ListItemIcon>
                            <Icon>public</Icon>
                        </ListItemIcon>
                        <ListItemText primary="cBioportal" />
                    </ListItem>
                </List>
            </div>
        </Drawer>
    );
}

export default MenuDrawer;


