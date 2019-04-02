import React from 'react';
import {withStyles} from '@material-ui/core/styles';
import Typography from "@material-ui/core/Typography";
import styles from './Footer.styles';

const Footer = ({classes, workspaceName, version}) => (
    <footer className={classes.root}>
        <Typography variant="body2" className={classes.text}>
            {`${workspaceName} ${version}`}
        </Typography>
    </footer>
);

export default withStyles(styles)(Footer);
