import React from 'react';
import {CircularProgress} from '@mui/material';

import withStyles from '@mui/styles/withStyles';

const styles = theme => ({
    inlayProgress: {
        margin: theme.spacing(2),
        textAlign: 'center',
        backgroundColor: 'transparent'
    }
});

const loadingInlay = (props) => (
    <div className={props.inlayProgress} data-testid="loading">
        <CircularProgress />
    </div>
);

export const LoadingInlay = withStyles(styles)(loadingInlay);

export default LoadingInlay;
