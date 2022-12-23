import React from 'react';
import {withRouter} from "react-router-dom";
import { Snackbar } from "@mui/material";
import withStyles from '@mui/styles/withStyles';
import { Alert } from '@mui/material';

const styles = theme => ({
    alertRoot: {
        display: 'flex',
        justifyContent: 'flex-end',
        border: `1px solid ${theme.palette.error.main}`
    },
    snackbarRoot: {
        paddingTop: 50
    }
});

const StatusAlert = ({children, classes}) => (
    <Snackbar
        anchorOrigin={{vertical: 'top', horizontal: 'right'}}
        className={classes.snackbarRoot}
        open
    >
        <Alert severity="error" className={classes.alertRoot}>
            {children}
        </Alert>
    </Snackbar>
);

export default withRouter(withStyles(styles)(StatusAlert));
