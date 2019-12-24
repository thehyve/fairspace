import React, {useState} from 'react';
import Grid from '@material-ui/core/Grid';
import {BreadCrumbs, usePageTitleUpdater} from "../common";

import * as consts from '../constants';
import CollectionBreadcrumbsContextProvider from "./CollectionBreadcrumbsContextProvider";
import CollectionBrowser from "./CollectionBrowser";
import InformationDrawer from '../common/components/InformationDrawer';
import {useSingleSelection} from "../file/UseSelection";
import {LoadingOverlay} from "../common/components";

const CollectionsPage = () => {
    usePageTitleUpdater("Collections");

    const [busy, setBusy] = useState(false);
    const {isSelected, select, selected} = useSingleSelection();

    return (
        <CollectionBreadcrumbsContextProvider>
            <BreadCrumbs />
            <Grid container spacing={1}>
                <Grid item style={{width: consts.MAIN_CONTENT_WIDTH, maxHeight: consts.MAIN_CONTENT_MAX_HEIGHT}}>
                    <CollectionBrowser
                        isSelected={collection => isSelected(collection.iri)}
                        selectCollection={collection => select(collection.iri)}
                    />
                </Grid>
                <Grid item style={{width: consts.SIDE_PANEL_WIDTH}}>
                    <InformationDrawer
                        inCollectionsBrowser
                        setBusy={setBusy}
                        selectedCollectionIri={selected}
                    />
                </Grid>
            </Grid>
            <LoadingOverlay loading={busy} />
        </CollectionBreadcrumbsContextProvider>
    );
};

export default CollectionsPage;
