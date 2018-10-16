import React from 'react';
import {connect} from 'react-redux';
import styles from './Footer.styles';
import {withStyles} from '@material-ui/core/styles';
import Typography from "@material-ui/core/Typography";

const Footer = ({classes, name, version}) => (
    <footer className={classes.footer}>
        <Typography variant="body2" className={classes.text}>{name} {version}</Typography>
    </footer>
)

function mapStateToProps(state) {
    const data = state.workspace.data;
    return {
        name: data ? data.name : '',
        version: data ? data.version : ''
    };
}

export default connect(mapStateToProps)(withStyles(styles)(Footer));


