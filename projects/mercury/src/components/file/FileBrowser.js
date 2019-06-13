import React from 'react';
import {withRouter} from "react-router-dom";

import {
    ErrorDialog, MessageDisplay,
    LoadingInlay
} from "../common";
import FileList from "./FileList";
import FileOperations from "./FileOperations";
import FileAPI from "../../services/FileAPI";

class FileBrowser extends React.Component {
    historyListener = null;

    state = {busy: false};

    componentDidMount() {
        this.historyListener = this.props.history.listen(() => {
            this.props.onDeselectAll();
        });
    }

    componentWillUnmount() {
        if (this.historyListener) {
            this.historyListener();
        }
    }

    handlePathCheckboxClick = (path) => {
        const {selectedPaths, selectPath, deselectPath} = this.props;
        const isPathSelected = selectedPaths.some(el => el === path.filename);

        // If this path is already selected, deselect
        if (isPathSelected) {
            deselectPath(path.filename);
        } else {
            selectPath(path.filename);
        }
    }

    // A highlighting of a path means only this path would be selected/checked
    handlePathHighlight = (path) => {
        const {onDeselectAll, selectPath} = this.props;

        onDeselectAll();
        selectPath(path.filename);
    }

    handlePathDoubleClick = (path) => {
        if (path.type === 'directory') {
            this.openDir(path.filename);
        } else {
            FileAPI.open(path.filename);
        }
    }

    handlePathDelete = (path) => {
        return this.onFileOperation(this.props.deleteFile(path.filename))
            .catch((err) => {
                ErrorDialog.showError(err, "An error occurred while deleting file or directory", () => this.handlePathDelete(path));
            });
    }

    handlePathRename = (path, newName) => {
        const {
            renameFile, openedPath
        } = this.props;

        return this.onFileOperation(renameFile(openedPath, path.basename, newName))
            .catch((err) => {
                ErrorDialog.showError(err, "An error occurred while renaming file or directory", () => this.handlePathRename(path, newName));
                return false;
            });
    }

    openDir(path) {
        this.props.history.push(`/collections${path}`);
    }

    onFileOperation = (operationPromise) => {
        this.setState({busy: true});
        return operationPromise
            .then(r => {
                this.props.fetchFilesIfNeeded(this.props.openedPath);
                this.setState({busy: false});
                return r;
            })
            .catch(e => {
                this.setState({busy: false});
                return Promise.reject(e);
            });
    }

    render() {
        const {
            loading, error, openedCollection, files = [], selectedPaths, openedPath,
            onSelectAll, onDeselectAll
        } = this.props;
        const collectionExists = openedCollection && openedCollection.iri;

        if (error) {
            return (<MessageDisplay message="An error occurred while loading files" />);
        }

        if (loading || this.state.busy) {
            return <LoadingInlay />;
        }

        const filesWithSelectionState = files.map(item => ({
            item,
            selected: selectedPaths.includes(item.filename)
        }));

        const allSelectionChangeHandler = (selectAll) => {
            if (selectAll) {
                onSelectAll();
            } else {
                onDeselectAll();
            }
        };

        return (
            <>
                {collectionExists
                    ? (
                        <FileList
                            selectionEnabled
                            files={filesWithSelectionState}
                            onPathCheckboxClick={this.handlePathCheckboxClick}
                            onPathHighlight={this.handlePathHighlight}
                            onPathDoubleClick={this.handlePathDoubleClick}
                            onAllSelection={allSelectionChangeHandler}
                        />
                    ) : 'Collection does not exist.'
                }
                <div style={{marginTop: 8}}>
                    <FileOperations
                        openedCollection={openedCollection}
                        openedPath={openedPath}
                        onRename={this.handlePathRename}
                        onDelete={this.handlePathDelete}
                        disabled={!openedCollection.canWrite}
                        existingFiles={files ? files.map(file => file.basename) : []}
                        getDownloadLink={FileAPI.getDownloadLink}
                        onFileOperation={this.onFileOperation}
                    />
                </div>
            </>
        );
    }
}

export default withRouter(FileBrowser);
