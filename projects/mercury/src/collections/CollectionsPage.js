import React, {useState} from 'react';
import Grid from '@material-ui/core/Grid';
import {BreadCrumbs, SearchBar, usePageTitleUpdater} from "../common";

import * as consts from '../constants';
import CollectionBreadcrumbsContextProvider from "./CollectionBreadcrumbsContextProvider";
import CollectionBrowser from "./CollectionBrowser";
import InformationDrawer from '../common/components/InformationDrawer';
import {useSingleSelection} from "../file/UseSelection";
import {LoadingOverlay} from "../common/components";
import useLinkedDataSearchParams from "../metadata/UseLinkedDataSearchParams";

const CollectionsPage = () => {
    usePageTitleUpdater("Collections");

    const {query, setQuery} = useLinkedDataSearchParams();
    const [busy, setBusy] = useState(false);
    const {isSelected, toggle, selected} = useSingleSelection();

    return (
        <CollectionBreadcrumbsContextProvider>
            <BreadCrumbs />
            <Grid container spacing={1}>
                <Grid
                    container
                    item
                    direction="column"
                    spacing={2}
                    style={{width: consts.MAIN_CONTENT_WIDTH, maxHeight: consts.MAIN_CONTENT_MAX_HEIGHT}}
                >
                    <Grid item justify="center">
                        <SearchBar
                            placeholder="Search"
                            disableUnderline={false}
                            onSearchChange={setQuery}
                        />
                    </Grid>
                    <Grid item>
                        <CollectionBrowser
                            query={query}
                            isSelected={collection => isSelected(collection.iri)}
                            toggleCollection={collection => toggle(collection.iri)}
                        />
                    </Grid>
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
