import React, {useContext, useEffect, useState} from 'react';
import Grid from '@mui/material/Grid';
import withStyles from '@mui/styles/withStyles';
import {useHistory} from "react-router-dom";
import queryString from "query-string";
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
import {getRelativePath} from "./externalStorageUtils";
import type {Match} from "../types";
import ExternalStorageInformationDrawer from "./ExternalStorageInformationDrawer";
import {handleTextSearchRedirect} from "../search/searchUtils";
import {joinPathsAvoidEmpty} from "../file/fileUtils";
import {PATH_SEPARATOR} from "../constants";

type ContextualExternalStoragePageProperties = {
    match: Match;
    location: Location;
    classes: any;
}

type ExternalStoragePageProperties = ContextualExternalStoragePageProperties & {
    externalStorages: ExternalStorage[];
    history: History;
}

export const ExternalStoragePage = (props: ExternalStoragePageProperties) => {
    const {externalStorages = [], match, location, history, classes = {}} = props;

    const [breadcrumbSegments, setBreadcrumbSegments] = useState([]);
    const [atLeastSingleRootFileExists, setAtLeastSingleRootFileExists] = useState(false);
    const storage: ExternalStorage = externalStorages.find(s => s.name === match.params.storage);
    const selection = useSingleSelection();
    const isSearchAvailable = storage && !!storage.searchPath;
    const preselectedFile = location.search ? decodeURIComponent(queryString.parse(location.search).selection) : undefined;

    usePageTitleUpdater(storage ? storage.label : "External storage");

    useEffect(() => {
        if (preselectedFile) {
            selection.select(preselectedFile);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [preselectedFile]);

    const handleSearch = (value: string) => {
        const relativePath = getRelativePath(location.pathname, storage.name);
        let context = "";
        if (relativePath && relativePath !== PATH_SEPARATOR) {
            context = encodeURI(joinPathsAvoidEmpty(storage.rootDirectoryIri, relativePath));
        }
        handleTextSearchRedirect(history, value, context, storage);
    };

    if (!storage) {
        return <MessageDisplay message={`Storage "${match.params.storage}" not found.`} />;
    }

    const getSearchPlaceholder = () => {
        const openedPath = getRelativePath(location.pathname, storage.name);
        const parentFolderName = openedPath ? openedPath.substring(openedPath.lastIndexOf('/') + 1) : null;
        return parentFolderName ? `Search in ${parentFolderName}` : `Search in all folders`;
    };

    return (
        <ExternalStorageBreadcrumbsContextProvider storage={storage}>
            <BreadCrumbs additionalSegments={breadcrumbSegments} />
            {isSearchAvailable && (
                <Grid container justifyContent="space-between" spacing={1}>
                    <Grid item className={classes.topBar}>
                        <SearchBar
                            placeholder={getSearchPlaceholder()}
                            onSearchChange={handleSearch}
                            width="50%"
                        />
                    </Grid>
                </Grid>
            )}
            <Grid container spacing={1}>
                <Grid item className={classes.centralPanel}>
                    <ExternalStorageBrowser
                        selection={selection}
                        preselectedFile={preselectedFile}
                        storage={storage}
                        pathname={location.pathname}
                        setBreadcrumbSegments={setBreadcrumbSegments}
                        setAtLeastSingleRootFileExists={setAtLeastSingleRootFileExists}
                    />
                </Grid>
                <Grid item className={classes.sidePanel}>
                    <ExternalStorageInformationDrawer
                        atLeastSingleRootFileExists={atLeastSingleRootFileExists}
                        path={getRelativePath(location.pathname, storage.name)}
                        selected={selection.selected}
                        storage={storage}
                    />
                </Grid>
            </Grid>
        </ExternalStorageBreadcrumbsContextProvider>
    );
};

const ContextualExternalStoragePage = (props: ContextualExternalStoragePageProperties) => {
    const {externalStorages = []} = useContext(ExternalStoragesContext);
    const history = useHistory();

    return (
        <ExternalStoragePage
            {...props}
            externalStorages={externalStorages}
            history={history}
        />
    );
};

export default withStyles(styles)(ContextualExternalStoragePage);
