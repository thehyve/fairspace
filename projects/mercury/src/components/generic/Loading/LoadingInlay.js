import React from 'react';
import CircularProgress from '@material-ui/core/CircularProgress/CircularProgress';
import {withStyles} from '@material-ui/core/styles';

const styles = theme => ({
    inlayProgress: {
        margin: theme.spacing.unit * 2,
        textAlign: 'center',
        backgroundColor: 'transparent'
    }
});

const loadingInlay = (props) => (
    <div className={props.inlayProgress}>
        <CircularProgress />
    </div>
);

export default withStyles(styles)(loadingInlay);
