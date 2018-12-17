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

class LoadingInlay extends React.Component {
    render() {
        const {classes} = this.props;
        return (
            <div className={classes.inlayProgress}>
                <CircularProgress />
            </div>
        );
    }
}

export default withStyles(styles)(LoadingInlay);
