import React, {useContext, useState} from 'react';
import Grid from '@material-ui/core/Grid';
import {withStyles} from "@material-ui/core";
import {useHistory} from "react-router-dom";
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
import UsersContext from "../users/UsersContext";
import type {User} from "../users/UsersAPI";
import {handleTextSearchRedirect} from "../search/searchUtils";

type ContextualExternalStoragePageProperties = {
    match: Match;
    location: Location;
    classes: any;
}

type ExternalStoragePageProperties = ContextualExternalStoragePageProperties & {
    externalStorages: ExternalStorage[];
    users: User[];
    history: History;
}

export const ExternalStoragePage = (props: ExternalStoragePageProperties) => {
    const {externalStorages, match, location, users, history, classes = {}} = props;

    const [breadcrumbSegments, setBreadcrumbSegments] = useState([]);
    const [atLeastSingleRootFileExists, setAtLeastSingleRootFileExists] = useState(false);
    const storage: ExternalStorage = externalStorages.find(s => s.name === match.params.storage);
    const selection = useSingleSelection();
    const isSearchAvailable = storage && !!storage.searchUrl;

    usePageTitleUpdater(storage ? storage.label : "External storage");

    const handleSearch = (value: string) => {
        const context = encodeURI(storage.url + getRelativePath(location.pathname, storage.name));
        handleTextSearchRedirect(history, value, context, storage.name);
    };

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
                        setAtLeastSingleRootFileExists={setAtLeastSingleRootFileExists}
                    />
                </Grid>
                <Grid item className={classes.sidePanel}>
                    <ExternalStorageInformationDrawer
                        atLeastSingleRootFileExists={atLeastSingleRootFileExists}
                        path={getRelativePath(location.pathname, storage.name)}
                        selected={selection.selected}
                        storage={storage}
                        users={users}
                    />
                </Grid>
            </Grid>
        </ExternalStorageBreadcrumbsContextProvider>
    );
};

const ContextualExternalStoragePage = (props: ContextualExternalStoragePageProperties) => {
    const {externalStorages = []} = useContext(ExternalStoragesContext);
    const {users} = useContext(UsersContext);
    const history = useHistory();

    return (
        <ExternalStoragePage
            {...props}
            externalStorages={externalStorages}
            users={users}
            history={history}
        />
    );
};

export default withStyles(styles)(ContextualExternalStoragePage);
