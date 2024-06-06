import React from 'react';
import makeStyles from '@mui/styles/makeStyles';
import {Fade} from '@mui/material';
import LoadingInlay from './LoadingInlay';

const useStyles = makeStyles(theme => ({
    container: {
        position: 'relative'
    },
    spinner: {
        zIndex: theme.zIndex.drawer + 2,
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
    },
    transitionArea: {
        zIndex: theme.zIndex.drawer + 1,
        opacity: 0.4
    },
    backdrop: {
        backgroundColor: '#747474',
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%'
    }
}));

const LoadingOverlayWrapper = React.forwardRef(({children, loading}, ref) => {
    const classes = useStyles();

    return (
        <div className={classes.container}>
            <div className={classes.transitionArea}>
                <Fade in={loading} timeout={{appear: 1500, enter: 200, exit: 100}}>
                    <div className={classes.backdrop} />
                </Fade>
            </div>
            {loading && (
                <div className={classes.spinner}>
                    <LoadingInlay />
                </div>
            )}
            <div ref={ref}>{children}</div>
        </div>
    );
});

export default LoadingOverlayWrapper;
