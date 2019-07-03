import React from 'react';
import Grid from '@material-ui/core/Grid';
import InformationDrawer from '../common/InformationDrawer';
import CollectionBrowserContainer from "./CollectionBrowserContainer";
import * as consts from '../../constants';
import BreadCrumbs from "../common/BreadCrumbs";

const collectionsPage = () => (
    <>
        <BreadCrumbs
            segments={[{
                label: 'Collections',
                icon: 'folder_open',
                href: '/collections'
            }]}
        />
        <Grid container spacing={8}>
            <Grid item style={{width: consts.MAIN_CONTENT_WIDTH, maxHeight: consts.MAIN_CONTENT_MAX_HEIGHT}}>
                <CollectionBrowserContainer />
            </Grid>
            <Grid item style={{width: consts.SIDE_PANEL_WIDTH}}>
                <InformationDrawer />
            </Grid>
        </Grid>
    </>
);

export default (collectionsPage);
