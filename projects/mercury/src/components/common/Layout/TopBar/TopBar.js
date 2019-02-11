import React from 'react';
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import {connect} from "react-redux";

import UserMenu from "../UserMenu/UserMenu";
import logout from "../../../../services/logout";
import SearchBar from '../../SearchBar';

function TopBar(props) {
    const {classes, workspaceName} = props;

    return (
        <AppBar position="fixed" className={classes.appBar}>
            <Toolbar>
                <Typography variant="h6" color="inherit" noWrap className={classes.flex}>
                    {workspaceName}
                </Typography>
                <SearchBar />
                <UserMenu onLogout={logout} />
            </Toolbar>
        </AppBar>
    );
}

function mapStateToProps(state) {
    const data = {...state.workspace.data};
    return {
        workspaceName: data ? data.name : ''
    };
}

export default connect(mapStateToProps)(TopBar);
