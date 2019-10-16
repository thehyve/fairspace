import React, {useEffect, useState} from 'react';
import {withRouter} from "react-router-dom";
import {Button, Tab, Tabs} from "@material-ui/core";
import Play from "mdi-material-ui/Play";
import {LoadingInlay, MessageDisplay} from '@fairspace/shared-frontend';

import FileList from "./FileList";
import FileOperations from "./FileOperations";
import FileAPI from "./FileAPI";
import useSelection from "./UseSelection";
import UploadList from "./UploadList";
import useUploads from "./UseUploads";
import {UPLOAD_STATUS_INITIAL} from "../common/contexts/UploadsContext";

const TAB_FILES = 'FILES';
const TAB_UPLOAD = 'UPLOAD';

export const FileBrowser = ({
    history,
    files = [],
    openedCollection,
    openedPath,
    refreshFiles = () => {},
    fileActions = {},
    loading = false,
    error = false
}) => {
    const [currentTab, setCurrentTab] = useState(TAB_FILES);
    const {select, selectAll, deselectAll, toggle, isSelected, selected} = useSelection(files.map(f => f.filename));

    const existingFilenames = files ? files.map(file => file.basename) : [];
    const {uploads, enqueue, startAll} = useUploads(openedPath, existingFilenames);

    // Deselect all files on history changes
    useEffect(() => {
        const historyListener = history.listen(() => {
            deselectAll();
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
        deselectAll();
        select(path.filename);
    };

    const handlePathDoubleClick = (path) => {
        if (path.type === 'directory') {
            history.push(`/collections${path.filename}`);
        } else {
            FileAPI.open(path.filename);
        }
    };

    if (loading) {
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

    if (error) {
        return (<MessageDisplay message="An error occurred while loading files" />);
    }

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
                <Tab value={TAB_UPLOAD} label="Upload" data-testid="upload-tab" />
            </Tabs>

            {(currentTab === TAB_FILES) ? (
                <div data-testid="files-view">
                    <FileList
                        selectionEnabled
                        files={files.map(item => ({...item, selected: isSelected(item.filename)}))}
                        onPathCheckboxClick={path => toggle(path.filename)}
                        onPathHighlight={handlePathHighlight}
                        onPathDoubleClick={handlePathDoubleClick}
                        onAllSelection={shouldSelectAll => (shouldSelectAll ? selectAll() : deselectAll())}
                    />
                    <div style={{marginTop: 8}}>
                        <FileOperations
                            selectedPaths={selected}
                            files={files}
                            openedPath={openedPath}
                            disabled={!openedCollection.canWrite}
                            fileActions={fileActions}
                            clearSelection={deselectAll}
                            refreshFiles={refreshFiles}
                        />
                    </div>
                </div>
            ) : (
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
            )}
        </>
    );
};

export default withRouter(FileBrowser);
