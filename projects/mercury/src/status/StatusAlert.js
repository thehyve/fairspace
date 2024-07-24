import React from 'react';
import {withRouter} from 'react-router-dom';
import {Alert, Snackbar} from '@mui/material';
import withStyles from '@mui/styles/withStyles';

const styles = theme => ({
    alertRoot: {
        display: 'flex',
        justifyContent: 'flex-end',
        border: `1px solid ${theme.palette.error.main}`
    },
    snackbarRoot: {
        paddingTop: 0
    }
});

const StatusAlert = ({children, classes}) => (
    <Snackbar anchorOrigin={{vertical: 'top', horizontal: 'right'}} className={classes.snackbarRoot} open>
        <Alert severity="error" className={classes.alertRoot}>
            {children}
        </Alert>
    </Snackbar>
);

export default withRouter(withStyles(styles)(StatusAlert));
