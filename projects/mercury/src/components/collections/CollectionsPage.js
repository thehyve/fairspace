import React from 'react';
import Grid from '@material-ui/core/Grid';

import {BreadCrumbs} from '../common';
import InformationDrawer from '../common/InformationDrawer';
import CollectionBrowser from "./CollectionBrowser";
import * as consts from '../../constants';

const collectionsPage = () => (
    <>
        <BreadCrumbs />
        <Grid container spacing={8}>
            <Grid item style={{width: consts.MAIN_CONTENT_WIDTH, maxHeight: consts.MAIN_CONTENT_MAX_HEIGHT}}>
                <CollectionBrowser />
            </Grid>
            <Grid item style={{width: consts.SIDE_PANEL_WIDTH}}>
                <InformationDrawer />
            </Grid>
        </Grid>
    </>
);

export default (collectionsPage);
