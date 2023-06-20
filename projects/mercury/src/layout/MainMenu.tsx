// @ts-nocheck
import React, { useContext } from "react";
import withStyles from "@mui/styles/withStyles";
import { NavLink } from "react-router-dom";
import { Divider, List, ListItemButton, ListItemIcon, ListItemText } from "@mui/material";
import { Assignment, Folder, FolderSpecial, OpenInNew, VerifiedUser, Widgets } from "@mui/icons-material";
import ServicesContext from "../common/contexts/ServicesContext";
import UserContext from "../users/UserContext";
import { isAdmin } from "../users/userUtils";
import MetadataViewContext from "../metadata/views/MetadataViewContext";
import ExternalStoragesContext from "../external-storage/ExternalStoragesContext";
import { getExternalStoragePathPrefix } from "../external-storage/externalStorageUtils";
const styles = {
  mainMenuButton: {
    paddingTop: 15,
    paddingBottom: 15
  }
};

const MainMenu = ({
  classes
}) => {
  const {
    pathname
  } = window.location;
  const {
    services
  } = useContext(ServicesContext);
  const {
    currentUser
  } = useContext(UserContext);
  const {
    externalStorages
  } = useContext(ExternalStoragesContext);
  const {
    views
  } = useContext(MetadataViewContext);

  // eslint-disable-next-line no-template-curly-in-string
  const interpolate = s => s.replace('${username}', currentUser.username);

  return <>
            <List>
                <ListItemButton className={classes.mainMenuButton} component={NavLink} to="/workspaces" selected={pathname.startsWith('/workspace')}>
                    <ListItemIcon>
                        <Widgets />
                    </ListItemIcon>
                    <ListItemText primary="Workspaces" />
                </ListItemButton>
                <ListItemButton className={classes.mainMenuButton} key="collections" component={NavLink} to="/collections" selected={pathname.startsWith('/collections')}>
                    <ListItemIcon>
                        <Folder />
                    </ListItemIcon>
                    <ListItemText primary="Collections" />
                </ListItemButton>
                {externalStorages && externalStorages.map(storage => <ListItemButton className={classes.mainMenuButton} key={getExternalStoragePathPrefix(storage.name)} component={NavLink} to={getExternalStoragePathPrefix(storage.name)} selected={pathname.startsWith(getExternalStoragePathPrefix(storage.name))}>
                        <ListItemIcon>
                            <FolderSpecial />
                        </ListItemIcon>
                        <ListItemText primary={storage.label} />
                    </ListItemButton>)}
                {views && views.length > 0 && currentUser.canViewPublicMetadata && <ListItemButton className={classes.mainMenuButton} key="metadata-views" component={NavLink} to="/metadata-views" selected={pathname.startsWith('/metadata-views')}>
                        <ListItemIcon>
                            <Assignment />
                        </ListItemIcon>
                        <ListItemText primary="Metadata" />
                    </ListItemButton>}
                {isAdmin(currentUser) && <ListItemButton className={classes.mainMenuButton} key="users" component={NavLink} to="/users" selected={pathname.startsWith('/users')}>
                        <ListItemIcon>
                            <VerifiedUser />
                        </ListItemIcon>
                        <ListItemText primary="Users" />
                    </ListItemButton>}
            </List>

            <div>
                <Divider />
                <List>
                    {Object.keys(services).map(key => <ListItemButton className={classes.mainMenuButton} component="a" target="_blank" href={interpolate(services[key])} key={'service-' + key}>
                                <ListItemIcon>
                                    <OpenInNew />
                                </ListItemIcon>
                                <ListItemText primary={key} />
                            </ListItemButton>)}
                </List>
            </div>
        </>;
};

export default withStyles(styles)(MainMenu);