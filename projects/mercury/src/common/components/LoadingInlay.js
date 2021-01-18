import React from 'react';
import {CircularProgress, withStyles} from '@material-ui/core';

const styles = theme => ({
    inlayProgress: {
        margin: theme.spacing(2),
        textAlign: 'center',
        backgroundColor: 'transparent'
    }
});

const loadingInlay = (props) => (
    <div className={props.inlayProgress}>
        <CircularProgress />
    </div>
);

export const LoadingInlay = withStyles(styles)(loadingInlay);

export default LoadingInlay;
