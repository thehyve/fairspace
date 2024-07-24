import React from 'react';
import HubIcon from '@mui/icons-material/Hub';
import {Icon, Link, Paper, Typography} from '@mui/material';
import withStyles from '@mui/styles/withStyles';
import styles from './DomainInfo.styles';

const DomainInfo = props => {
    const {domainName, domainLink, domainIcon, classes} = props;
    return (
        <div className={classes.outerMargin}>
            <Link href={domainLink} className={classes.link}>
                <Paper className={classes.paper}>
                    <Typography variant="h5" className={classes.domainText}>
                        {domainName}
                    </Typography>
                    {domainIcon ? (
                        <Icon classes={{root: classes.imageIconRoot}} size="large">
                            <img alt={domainName} src={domainIcon} className={classes.imageIcon} />
                        </Icon>
                    ) : (
                        <HubIcon className={classes.icon} />
                    )}
                </Paper>
            </Link>
        </div>
    );
};

export default withStyles(styles)(DomainInfo);
