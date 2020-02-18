import React, {useState} from 'react';
import Grid from '@material-ui/core/Grid';
import {BreadCrumbs, SearchBar, usePageTitleUpdater} from "../common";

import * as consts from '../constants';
import CollectionBreadcrumbsContextProvider from "./CollectionBreadcrumbsContextProvider";
import CollectionBrowser from "./CollectionBrowser";
import InformationDrawer from '../common/components/InformationDrawer';
import {useSingleSelection} from "../file/UseSelection";
import {LoadingOverlay} from "../common/components";
import {handleCollectionSearchRedirect} from "../common/utils/collectionUtils";

const CollectionsPage = ({history}) => {
    usePageTitleUpdater("Collections");

    const [busy, setBusy] = useState(false);
    const {isSelected, toggle, selected} = useSingleSelection();

    const handleSearch = (value) => {
        handleCollectionSearchRedirect(history, value);
    };

    return (
        <CollectionBreadcrumbsContextProvider>
            <BreadCrumbs />
            <div style={{marginBottom: 16, width: consts.MAIN_CONTENT_WIDTH}}>
                <SearchBar
                    placeholder="Search"
                    disableUnderline={false}
                    onSearchChange={handleSearch}
                />
            </div>
            <Grid container spacing={1}>
                <Grid item style={{width: consts.MAIN_CONTENT_WIDTH, maxHeight: consts.MAIN_CONTENT_MAX_HEIGHT}}>
                    <CollectionBrowser
                        isSelected={collection => isSelected(collection.iri)}
                        toggleCollection={collection => toggle(collection.iri)}
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
