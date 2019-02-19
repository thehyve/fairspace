import React from 'react';
import {Grid, AppBar, Tabs, Tab} from '@material-ui/core';

import CollectionList from '../collections/CollectionList';
import FileList from '../file/FileList';
import {COLLECTION_SEARCH_TYPE, FILES_SEARCH_TYPE} from '../../constants';
import {LoadingInlay, ErrorMessage} from "../common";

const searchResults = ({
    loading,
    type,
    results,
    onTypeChange,
    onCollectionOpen,
    onFileOpen,
    error,
}) => {
    if (error && !loading) {
        return <ErrorMessage message={error} />;
    }

    const selectedTabIndex = type === FILES_SEARCH_TYPE ? 1 : 0;

    return (
        <Grid container spacing={8}>
            <Grid item xs={12}>
                <AppBar square elevation={2} position="static" color="default">
                    <Tabs
                        value={selectedTabIndex}
                        onChange={(e, idx) => onTypeChange(idx === 0 ? COLLECTION_SEARCH_TYPE : FILES_SEARCH_TYPE)}
                        centered
                    >
                        <Tab disabled={loading} label="Collections" />
                        <Tab disabled={loading} label="Files" />
                    </Tabs>
                </AppBar>
            </Grid>

            {
                loading
                    ? <LoadingInlay />
                    : (
                        <Grid item xs={12}>
                            {selectedTabIndex === 0 && (
                                <CollectionList
                                    collections={results}
                                    onCollectionClick={() => {}}
                                    onCollectionDoubleClick={onCollectionOpen}
                                />
                            )}
                            {selectedTabIndex === 1 && (
                                <FileList
                                    files={results}
                                    selectedPaths={[]}
                                    onPathClick={() => {}}
                                    onPathDoubleClick={onFileOpen}
                                    onRename={() => {}}
                                    onDelete={() => {}}
                                />
                            )}
                        </Grid>
                    )
            }

        </Grid>
    );
};

export default searchResults;
