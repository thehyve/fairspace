import React from 'react';
import Grid from '@material-ui/core/Grid';

import {BreadCrumbs} from '../common';
import InformationDrawer from '../common/InformationDrawer';
import CollectionBrowser from "./CollectionBrowser";

const collectionsPage = () => (
    <>
        <BreadCrumbs />
        <Grid container spacing={8}>
            <Grid item style={{width: '55%'}}>
                <CollectionBrowser />
            </Grid>
            <Grid item style={{width: '45%'}}>
                <InformationDrawer />
            </Grid>
        </Grid>
    </>
);

export default (collectionsPage);
