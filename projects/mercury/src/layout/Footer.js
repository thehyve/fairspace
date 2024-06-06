import React from 'react';
import withStyles from '@mui/styles/withStyles';
import Typography from '@mui/material/Typography';
import styles from './Footer.styles';

const Footer = ({classes, content}) => (
    <footer className={classes.root}>
        <Typography variant="body2" className={classes.text}>
            {content}
        </Typography>
    </footer>
);

export default withStyles(styles)(Footer);
