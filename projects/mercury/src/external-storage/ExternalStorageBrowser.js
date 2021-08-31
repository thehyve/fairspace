import React, {useEffect} from 'react';
import {withRouter} from "react-router-dom";
import {withStyles} from "@material-ui/core";
import MessageDisplay from "../common/components/MessageDisplay";
import LoadingInlay from "../common/components/LoadingInlay";
import {useExternalStorage} from "./UseExternalStorage";
import FileList from "../file/FileList";
import {File} from "../file/FileAPI";
import {splitPathIntoArray} from "../file/fileUtils";
import FileOperations from "../file/FileOperations";
import type {ExternalStorage} from "./externalStorageUtils";
import {getExternalStorageAbsolutePath, getExternalStoragePathPrefix, getRelativePath} from "./externalStorageUtils";
import * as consts from "../constants";

const styles = () => ({
    fileBrowser: {
        marginTop: 12
    },
    fileOperations: {
        marginTop: 8
    }
});

type ContextualExternalStorageBrowserProperties = {
    pathname: string;
    storage: ExternalStorage;
    selection: any;
    preselectedFile: File;
    setBreadcrumbSegments: () => void;
    history: History;
    classes: any;
    setAtLeastSingleRootFileExists: (boolean) => void;
};

type ExternalStorageBrowserProperties = ContextualExternalStorageBrowserProperties & {
    loading: boolean;
    error: Error;
    files: File[];
    fileActions: any;
    openedPath: string;
};

export const ExternalStorageBrowser = (props: ExternalStorageBrowserProperties) => {
    const {
        loading = false,
        error,
        storage,
        files,
        fileActions,
        selection,
        preselectedFile,
        setBreadcrumbSegments = () => {},
        openedPath = "",
        history,
        classes
    } = props;

    const pathSegments = splitPathIntoArray(openedPath);
    const breadcrumbSegments = pathSegments.map((segment, idx) => ({
        label: segment,
        href: getExternalStoragePathPrefix(storage.name)
            + consts.PATH_SEPARATOR
            + pathSegments.slice(0, idx + 1).map(encodeURIComponent).join(consts.PATH_SEPARATOR)
    }));

    useEffect(() => {
        setBreadcrumbSegments(breadcrumbSegments);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [openedPath]);

    const handlePathDoubleClick = (path) => {
        selection.deselectAll();
        if (path.type === 'directory') {
            history.push(getExternalStorageAbsolutePath(path.filename, storage.name));
        }
    };

    const handlePathClick = (path) => {
        selection.toggle(path.filename);
    };

    if (error) {
        return <MessageDisplay message={`An error occurred while loading data from ${storage.label}.`} />;
    }
    if (loading) {
        return <LoadingInlay />;
    }

    return (
        <div className={classes.fileBrowser} data-testid="externals-storage-view">
            <FileList
                selectionEnabled={false}
                preselectedFile={preselectedFile}
                files={files.map(item => ({...item, selected: selection.isSelected(item.filename)}))}
                onPathHighlight={handlePathClick}
                onPathDoubleClick={handlePathDoubleClick}
                onAllSelection={() => {}}
                showDeleted={false}
            />
            <div className={classes.fileOperations}>
                <FileOperations
                    selectedPaths={[selection.selected]}
                    files={files}
                    isWritingEnabled={false}
                    showDeleted={false}
                    fileActions={fileActions}
                    isExternalStorage
                />
            </div>
        </div>
    );
};

const ContextualExternalStorageBrowser = (props: ContextualExternalStorageBrowserProperties) => {
    const {pathname, storage, setAtLeastSingleRootFileExists} = props;
    const path = getRelativePath(pathname, storage.name);
    const {files = [], loading, error, fileActions} = useExternalStorage(path, storage.path);

    useEffect(() => {
        setAtLeastSingleRootFileExists(files.length > 0);
    }, [files, setAtLeastSingleRootFileExists]);

    return (
        <ExternalStorageBrowser
            {...props}
            files={files}
            fileActions={fileActions}
            openedPath={path}
            loading={loading}
            error={error}
        />
    );
};

export default withRouter(withStyles(styles)(ContextualExternalStorageBrowser));
