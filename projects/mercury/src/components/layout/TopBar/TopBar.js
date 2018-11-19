import React from 'react';
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import UserMenu from "../UserMenu/UserMenu";
import {logout} from "../../../services/Logout/logout";
import {connect} from "react-redux";

function TopBar(props) {
    const { classes, workspaceName } = props;

    return (
        <AppBar position="fixed" className={classes.appBar}>
            <Toolbar>
                <Typography variant="h6" color="inherit" noWrap className={classes.flex}>
                    {workspaceName}
                </Typography>
                <UserMenu onLogout={logout}></UserMenu>
            </Toolbar>
        </AppBar>
    );
}

function mapStateToProps(state) {
    const data = state.workspace.data;
    return {
        workspaceName: data ? data.name : ''
    };
}

export default connect(mapStateToProps)(TopBar);


