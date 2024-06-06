import React, {useContext} from 'react';

import withStyles from '@mui/styles/withStyles';
import {Grid, Link, Paper, Typography} from '@mui/material';
import BreadCrumbs from '../common/components/BreadCrumbs';
import styles from './DashboardPage.styles';
import MetadataViewContext from '../metadata/views/MetadataViewContext';
import ExternalMetadataSourceContext from '../metadata/metadata-sources/ExternalMetadataSourceContext';
import UserContext from '../users/UserContext';
import DomainInfo from './DomainInfo';
import {APPLICATION_NAME} from '../constants';
import InternalMetadataSourceContext from '../metadata/metadata-sources/InternalMetadataSourceContext';

const DashboardPage = props => {
    const {currentUser, classes} = props;
    const {views} = useContext(MetadataViewContext);
    const {externalMetadataSources} = useContext(ExternalMetadataSourceContext);
    const {internalMetadataIcon, internalMetadataLabel} = useContext(InternalMetadataSourceContext);
    const canViewMetadata = currentUser && currentUser.canViewPublicMetadata && views && views.length > 0;

    return (
        <Grid container justifyContent="center" spacing="5">
            <BreadCrumbs />
            <Paper className={classes.mainPage}>
                <Grid container justifyContent="center" spacing="5">
                    <Grid container justifyContent="center" spacing="5">
                        <Typography className={classes.customFont} variant="h3" paragraph>
                            {APPLICATION_NAME}
                        </Typography>
                    </Grid>
                    <Grid container justifyContent="center" spacing="5" className={classes.header}>
                        <Typography variant="h5" paragraph>
                            research data management
                        </Typography>
                    </Grid>
                    <Grid container justifyContent="left" spacing="20" className={classes.textRow}>
                        <Grid item xs={6} md={5}>
                            <Typography variant="body1" paragraph>
                                {APPLICATION_NAME} contains your research metadata. Click on one of the domains and
                                start exploring.
                            </Typography>
                        </Grid>
                        <Grid item xs={6} md={2} />
                        <Grid item xs={6} md={5}>
                            <Typography variant="body1" paragraph>
                                For more details on how to use Fairspace, e.g. how to query the API, please refer the{' '}
                                <Link href="https://docs.fairway.app/">user manual</Link>.
                            </Typography>
                        </Grid>
                    </Grid>
                    <Grid container justifyContent="center" spacing="5">
                        {canViewMetadata && (
                            <DomainInfo
                                domainName={internalMetadataLabel}
                                domainLink="/metadata-views"
                                domainIcon={internalMetadataIcon}
                                key="metadata-views"
                            />
                        )}
                        {canViewMetadata &&
                            externalMetadataSources.map(source => (
                                <DomainInfo
                                    domainName={source.label}
                                    domainLink={'/metadata-sources/' + source.name}
                                    domainIcon={source.icon}
                                    key={source.name}
                                />
                            ))}
                    </Grid>
                </Grid>
            </Paper>
        </Grid>
    );
};

const ContextualDashboardPage = props => {
    const {currentUser} = useContext(UserContext);

    return <DashboardPage currentUser={currentUser} {...props} />;
};

export default withStyles(styles)(ContextualDashboardPage);
