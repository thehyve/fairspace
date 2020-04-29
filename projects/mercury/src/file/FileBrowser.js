import React, {useEffect, useState} from 'react';
import {withRouter} from "react-router-dom";
import {Button, Tab, Tabs} from "@material-ui/core";
import Play from "mdi-material-ui/Play";
import {LoadingInlay, MessageDisplay} from '../common';

import FileList from "./FileList";
import FileOperations from "./FileOperations";
import FileAPI from "./FileAPI";
import UploadList from "./UploadList";
import useUploads from "./UseUploads";
import {UPLOAD_STATUS_INITIAL} from "./UploadsContext";
import {useFiles} from "./UseFiles";

const TAB_FILES = 'FILES';
const TAB_UPLOAD = 'UPLOAD';

export const DisconnectedFileBrowser = ({
    history,
    openedCollection,
    collectionsLoading = false,
    collectionsError = false,
    openedPath,
    files = [],
    loading = false,
    error = false,
    refreshFiles = () => {},
    fileActions = {},
    selection = {}
}) => {
    const [currentTab, setCurrentTab] = useState(TAB_FILES);

    const isWritingEnabled = openedCollection && openedCollection.canWrite;
    const existingFilenames = files ? files.map(file => file.basename) : [];
    const {uploads, enqueue, startAll} = useUploads(openedPath, existingFilenames);

    // Deselect all files on history changes
    useEffect(() => {
        const historyListener = history.listen(() => {
            selection.deselectAll();
        });

        // Specify how to clean up after this effect:
        return historyListener;

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [history]);

    // Reload the files after returning from the upload tab
    useEffect(() => {
        refreshFiles(openedPath);

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentTab, openedPath]);

    // A highlighting of a path means only this path would be selected/checked
    const handlePathHighlight = path => {
        selection.deselectAll();
        selection.select(path.filename);
    };

    const handlePathDoubleClick = (path) => {
        if (path.type === 'directory') {
            history.push(`/collections${path.filename}`);
        } else {
            FileAPI.open(path.filename);
        }
    };

    if (loading || collectionsLoading) {
        return <LoadingInlay />;
    }

    const collectionExists = openedCollection && openedCollection.iri;
    if (!collectionExists) {
        return (
            <MessageDisplay
                message="This collection does not exist or you don't have sufficient permissions to view it."
                variant="h6"
                noWrap={false}
            />
        );
    }

    if (error || collectionsError) {
        return (<MessageDisplay message="An error occurred while loading files" />);
    }

    const renderFileOperations = () => (
        <div style={{marginTop: 8}}>
            <FileOperations
                selectedPaths={selection.selected}
                files={files}
                openedPath={openedPath}
                isWritingEnabled={isWritingEnabled}
                fileActions={fileActions}
                clearSelection={selection.deselectAll}
                refreshFiles={refreshFiles}
            />
        </div>
    );

    const renderTabFiles = () => (
        <div data-testid="files-view">
            <FileList
                selectionEnabled
                files={files.map(item => ({...item, selected: selection.isSelected(item.filename)}))}
                onPathCheckboxClick={path => selection.toggle(path.filename)}
                onPathHighlight={handlePathHighlight}
                onPathDoubleClick={handlePathDoubleClick}
                onAllSelection={shouldSelectAll => (shouldSelectAll ? selection.selectAll(files.map(file => file.filename)) : selection.deselectAll())}
            />
            {renderFileOperations()}
        </div>
    );

    const renderTabUpload = () => (
        <div data-testid="upload-view">
            <UploadList
                uploads={uploads}
                enqueue={enqueue}
            />
            <div style={{marginTop: 12}}>
                <Button
                    data-testid="upload-button"
                    color="primary"
                    variant="contained"
                    disabled={!uploads.find(upload => upload.status === UPLOAD_STATUS_INITIAL)}
                    onClick={startAll}
                >
                    <Play /> Start uploading
                </Button>
            </div>
        </div>
    );

    return (
        <>
            <Tabs
                data-testid="tabs"
                value={currentTab}
                onChange={(e, tab) => setCurrentTab(tab)}
                centered
                style={{marginBottom: 8}}
            >
                <Tab value={TAB_FILES} label="Files" />
                {isWritingEnabled && (
                    <Tab value={TAB_UPLOAD} label="Upload" data-testid="upload-tab" />
                )}
            </Tabs>
            {(currentTab === TAB_FILES) ? renderTabFiles() : renderTabUpload()}
        </>
    );
};

export default withRouter(({openedPath, fileApi, ...props}) => {
    const {files, loading, error, refresh, fileActions} = useFiles(openedPath, fileApi);
    return (
        <DisconnectedFileBrowser
            files={files}
            loading={loading}
            error={error}
            refreshFiles={refresh}
            fileActions={fileActions}
            openedPath={openedPath}
            fileApi={fileApi}
            {...props}
        />
    );
});
