import React from 'react';
// import ShortcutIcon from '@mui/icons-material/Shortcut';
import HubIcon from '@mui/icons-material/Hub';
import {Link, Paper, Typography} from "@mui/material";
import withStyles from "@mui/styles/withStyles";
import styles from "./DomainInfo.styles";

const DomainInfo = (props) => {
    const {domainName, domainLink, classes} = props;
    return (
        <div className={classes.outerMargin}>
            <Link href={domainLink}>
                <Paper className={classes.paper}>
                    <Typography variant="h6" className={classes.domainText}>
                        {domainName}
                    </Typography>
                    <HubIcon className={classes.icon} />
                </Paper>
            </Link>
        </div>
    );
};

export default withStyles(styles)(DomainInfo);
