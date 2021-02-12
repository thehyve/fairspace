import React, {useEffect} from 'react';
import {withRouter} from "react-router-dom";
import {withStyles} from "@material-ui/core";
import PropTypes from "prop-types";
import MessageDisplay from "../common/components/MessageDisplay";
import LoadingInlay from "../common/components/LoadingInlay";
import {useExternalStorage} from "./UseExternalStorage";
import FileList from "../file/FileList";
import FileOperations from "../file/FileOperations";
import {getExternalStorageAbsolutePath, getExternalStoragePathPrefix, getRelativePath} from "./externalStorageUtils";
import FileAPI from "../file/FileAPI";
import {splitPathIntoArray} from "../file/fileUtils";
import * as consts from "../constants";

const styles = () => ({
    fileBrowser: {
        marginTop: 12
    },
    fileOperations: {
        marginTop: 8
    }
});

export const ExternalStorageBrowser = ({
    loading,
    error,
    storage,
    files,
    fileActions,
    selection,
    setBreadcrumbSegments,
    openedPath,
    history,
    classes
}) => {
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
        if (path.type === 'directory') {
            history.push(getExternalStorageAbsolutePath(path.filename, storage.name));
        } else {
            FileAPI.open(path.filename);
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

ExternalStorageBrowser.propTypes = {
    loading: PropTypes.bool,
    error: PropTypes.object,
    storage: PropTypes.object,
    files: PropTypes.array,
    fileActions: PropTypes.object,
    selection: PropTypes.object,
    setBreadcrumbSegments: PropTypes.func,
    openedPath: PropTypes.string,
    history: PropTypes.object,
    classes: PropTypes.object
};

ExternalStorageBrowser.defaultProps = {
    loading: false,
    error: undefined,
    storage: {},
    files: [],
    fileActions: {},
    selection: {},
    setBreadcrumbSegments: () => {},
    classes: {}
};

const ContextualExternalStorageBrowser = (props) => {
    const {pathname, storage} = props;
    const path = getRelativePath(pathname, storage.name);
    const {files, loading, error, fileActions} = useExternalStorage(path, storage.url);

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
