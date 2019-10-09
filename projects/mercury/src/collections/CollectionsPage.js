import React from 'react';
import Grid from '@material-ui/core/Grid';
import {BreadCrumbs, usePageTitleUpdater} from "@fairspace/shared-frontend";

import InformationDrawer from '../common/components/InformationDrawer';
import CollectionBrowserContainer from "./CollectionBrowserContainer";
import * as consts from '../constants';
import CollectionBreadcrumbsContextProvider from "./CollectionBreadcrumbsContextProvider";

const CollectionsPage = () => {
    usePageTitleUpdater("Collections");

    return (
        <CollectionBreadcrumbsContextProvider>
            <BreadCrumbs />
            <Grid container spacing={8}>
                <Grid item style={{width: consts.MAIN_CONTENT_WIDTH, maxHeight: consts.MAIN_CONTENT_MAX_HEIGHT}}>
                    <CollectionBrowserContainer />
                </Grid>
                <Grid item style={{width: consts.SIDE_PANEL_WIDTH}}>
                    <InformationDrawer inCollectionsBrowser />
                </Grid>
            </Grid>
        </CollectionBreadcrumbsContextProvider>
    );
};

export default CollectionsPage;
