import React, {useContext} from 'react';

import withStyles from '@mui/styles/withStyles';
import {Divider, Grid, Link, Paper, Typography} from '@mui/material';
import styles from './DashboardPage.styles';
import MetadataViewContext from '../metadata/views/MetadataViewContext';
import ExternalMetadataSourceContext from '../metadata/metadata-sources/ExternalMetadataSourceContext';
import UserContext from '../users/UserContext';
import DomainInfo from './DomainInfo';
import {APPLICATION_DOCS_URL, APPLICATION_NAME, THE_HYVE_URL} from '../constants';
import InternalMetadataSourceContext from '../metadata/metadata-sources/InternalMetadataSourceContext';

const DashboardPage = props => {
    const {currentUser, classes} = props;
    const {views} = useContext(MetadataViewContext);
    const {externalMetadataSources} = useContext(ExternalMetadataSourceContext);
    const {internalMetadataIcon, internalMetadataLabel} = useContext(InternalMetadataSourceContext);
    const canViewMetadata = currentUser && currentUser.canViewPublicMetadata && views && views.length > 0;

    return (
        <Grid container spacing={3} className={classes.mainPage}>
            <Grid item xs={8}>
                <Paper elevation={8} className={classes.paperContent}>
                    <Typography className={classes.header} variant="h3" paragraph align="center">
                        Research Data Management
                    </Typography>
                    <Divider variant="middle" className={classes.divider} />
                    <Typography variant="body1" paragraph>
                        {APPLICATION_NAME} contains your research metadata. Click on one of the domains and start
                        exploring.
                    </Typography>
                    <Typography variant="body1" paragraph>
                        For more details on how to use Fairspace, e.g. how to query the API, please refer the{' '}
                        <Link className={classes.link} href={APPLICATION_DOCS_URL}>
                            user manual
                        </Link>
                        .
                    </Typography>
                </Paper>
            </Grid>
            <Grid item xs={4}>
                <Paper elevation={8} className={`${classes.paperContent} ${classes.paperContentDark}`}>
                    <Typography className={classes.header} variant="h4" paragraph align="center">
                        About
                    </Typography>
                    <Typography variant="body1" paragraph>
                        {APPLICATION_NAME} version: {process.env.REACT_APP_VERSION}
                    </Typography>
                    <Typography variant="body2" paragraph className={classes.footer} align="center">
                        {/* eslint-disable-next-line prettier/prettier */}
                        {"Created by "}
                        <Link className={classes.link} href={THE_HYVE_URL}>
                            The Hyve
                        </Link>
                    </Typography>
                </Paper>
            </Grid>
            <Grid item xs={8}>
                <Paper elevation={8} className={`${classes.paperContent} ${classes.paperContentLight}`}>
                    <Typography className={classes.header} variant="h4" paragraph align="center">
                        Ask AI
                    </Typography>
                </Paper>
            </Grid>
            <Grid item xs={4}>
                {canViewMetadata && (
                    <Paper elevation={8} className={classes.paperContent}>
                        <Typography className={classes.header} variant="h4" paragraph align="center">
                            Search the metadata
                        </Typography>
                        <Grid container spacing={1} elevation={6}>
                            <Grid item xs={6}>
                                <DomainInfo
                                    domainName={internalMetadataLabel}
                                    domainLink="/metadata-views"
                                    domainIcon={internalMetadataIcon}
                                    key="metadata-views"
                                />
                            </Grid>
                            {externalMetadataSources.map(source => (
                                <Grid item xs={6}>
                                    <DomainInfo
                                        domainName={source.label}
                                        domainLink={'/metadata-sources/' + source.name}
                                        domainIcon={source.icon}
                                        key={source.name}
                                    />
                                </Grid>
                            ))}
                        </Grid>
                    </Paper>
                )}
            </Grid>
        </Grid>
    );
};

const ContextualDashboardPage = props => {
    const {currentUser} = useContext(UserContext);

    return <DashboardPage currentUser={currentUser} {...props} />;
};

export default withStyles(styles)(ContextualDashboardPage);
