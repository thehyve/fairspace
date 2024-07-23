import React, {useContext} from 'react';

import withStyles from '@mui/styles/withStyles';
import {Grid, Link, Paper, Typography, TextField} from '@mui/material';
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
    const askAIConfigured = false;

    return (
        <Grid container spacing={5} className={classes.mainPage} direction="column" justifyContent="flex-start">
            <Grid item container spacing={5} justifyContent="flex-start" alignItems="stretch">
                <Grid item xs={7}>
                    <Paper elevation={3} className={classes.paperContent}>
                        <Typography
                            className={`${classes.header} ${classes.mainHeader}`}
                            variant="h3"
                            paragraph
                            align="center"
                        >
                            Research Data Management
                        </Typography>
                        <Typography variant="body1" paragraph className={classes.paragraph}>
                            {APPLICATION_NAME} contains your research metadata. Click on one of the domains in `Search
                            the metadata` card and start exploring.
                        </Typography>
                        <Typography variant="body1" paragraph className={classes.paragraph}>
                            For more details on how to use Fairspace, e.g. how to query the API, please refer the{' '}
                            <Link className={classes.link} href={APPLICATION_DOCS_URL}>
                                user manual
                            </Link>
                            .
                        </Typography>
                    </Paper>
                </Grid>
                <Grid item xs={5} container direction="column" justifyContent="flex-start" spacing={5}>
                    <Grid item>
                        {canViewMetadata && (
                            <Paper elevation={3} className={classes.paperContent}>
                                <Typography className={classes.header} variant="h4" paragraph align="center">
                                    Search the metadata
                                </Typography>
                                <Grid container spacing={1} direction="row" justifyContent="center">
                                    <Grid item xs={6} display="flex" justifyContent="center">
                                        <DomainInfo
                                            domainName={internalMetadataLabel}
                                            domainLink="/metadata-views"
                                            domainIcon={internalMetadataIcon}
                                            key="metadata-views"
                                        />
                                    </Grid>
                                    {externalMetadataSources.map(source => (
                                        <Grid
                                            item
                                            xs={6}
                                            key={`grid-${source.name}`}
                                            display="flex"
                                            justifyContent="center"
                                        >
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
                    <Grid item>
                        <Paper elevation={3} className={classes.paperContent}>
                            <Typography className={classes.header} variant="h4" paragraph align="center">
                                About
                            </Typography>
                            <Typography variant="body1" paragraph>
                                {APPLICATION_NAME} version: {process.env.REACT_APP_VERSION}
                            </Typography>
                            <Typography variant="body2" paragraph className={classes.footer} align="center">
                                {/* eslint-disable-next-line prettier/prettier */}
                                {'Created by '}
                                <Link className={classes.link} href={THE_HYVE_URL}>
                                    The Hyve
                                </Link>
                            </Typography>
                        </Paper>
                    </Grid>
                </Grid>
            </Grid>
            <Grid item xs={12}>
                {askAIConfigured && (
                    <Paper elevation={3} className={classes.paperContent}>
                        <Typography className={classes.header} variant="h4" paragraph align="center">
                            Ask AI
                        </Typography>
                        <Typography variant="h5" paragraph align="center">
                            What do you want to know more about?
                        </Typography>
                        <div className={classes.textFieldWrapper}>
                            <TextField
                                id="aiInput"
                                placeholder="Type your quetion here..."
                                variant="outlined"
                                className={classes.textField}
                            />
                        </div>
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
