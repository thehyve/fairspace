import React, {useContext, useState} from 'react';
import Grid from '@material-ui/core/Grid';
import {withStyles} from "@material-ui/core";
import PropTypes from "prop-types";
import usePageTitleUpdater from "../common/hooks/UsePageTitleUpdater";

import {useSingleSelection} from "../file/UseSelection";
import SearchBar from "../search/SearchBar";
import BreadCrumbs from "../common/components/BreadCrumbs";
import styles from "./ExternalStoragePage.styles";
import ExternalStorageBrowser from "./ExternalStorageBrowser";
import ExternalStoragesContext from "./ExternalStoragesContext";
import MessageDisplay from "../common/components/MessageDisplay";
import ExternalStorageBreadcrumbsContextProvider from "./ExternalStorageBreadcrumbsContextProvider";
import type {ExternalStorage} from "./externalStorageUtils";


export const ExternalStoragePage = ({match, location, externalStorages, classes}) => {
    const [breadcrumbSegments, setBreadcrumbSegments] = useState([]);
    const storage: ExternalStorage = externalStorages.find(s => s.name === match.params.storage);
    const selection = useSingleSelection();
    const isSearchAvailable = false; // TODO add search handling

    usePageTitleUpdater(storage ? storage.label : "External storage");

    const handleSearch = () => {};

    if (!storage) {
        return <MessageDisplay message={`Storage "${match.params.storage}" not found.`} />;
    }

    return (
        <ExternalStorageBreadcrumbsContextProvider storage={storage}>
            <BreadCrumbs additionalSegments={breadcrumbSegments} />
            {isSearchAvailable && (
                <Grid container justify="space-between" spacing={1}>
                    <Grid item className={classes.topBar}>
                        <SearchBar
                            placeholder="Search"
                            disableUnderline={false}
                            onSearchChange={handleSearch}
                            disabled
                        />
                    </Grid>
                </Grid>
            )}
            <Grid container spacing={1}>
                <Grid item className={classes.centralPanel}>
                    <ExternalStorageBrowser
                        selection={selection}
                        storage={storage}
                        pathname={location.pathname}
                        setBreadcrumbSegments={setBreadcrumbSegments}
                    />
                </Grid>
                <Grid item className={classes.sidePanel}>
                    {/* TODO add right panel */}
                </Grid>
            </Grid>
        </ExternalStorageBreadcrumbsContextProvider>
    );
};

ExternalStoragePage.propTypes = {
    match: PropTypes.object.isRequired,
    location: PropTypes.object.isRequired,
    externalStorages: PropTypes.array.isRequired,
    classes: PropTypes.object
};

ExternalStoragePage.defaultProps = {
    classes: {}
};

const ContextualExternalStoragePage = (props) => {
    const {externalStorages = []} = useContext(ExternalStoragesContext);

    return (
        <ExternalStoragePage
            {...props}
            externalStorages={externalStorages}
        />
    );
};

export default withStyles(styles)(ContextualExternalStoragePage);
