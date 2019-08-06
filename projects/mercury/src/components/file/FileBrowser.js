import React from 'react';
import {withRouter} from "react-router-dom";

import {
    MessageDisplay,
    LoadingInlay
} from "../common";
import FileList from "./FileList";
import FileOperations from "./FileOperations";
import FileAPI from "../../services/FileAPI";

class FileBrowser extends React.Component {
    historyListener = null;

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


    openDir(path) {
        this.props.history.push(`/collections${path}`);
    }

    render() {
        const {
            loading, error, openedCollection, files = [], selectedPaths, openedPath, fetchFilesIfNeeded,
            onSelectAll, onDeselectAll
        } = this.props;
        const collectionExists = openedCollection && openedCollection.iri;

        if (error) {
            return (<MessageDisplay message="An error occurred while loading files" />);
        }

        if (loading) {
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

        if (!collectionExists) {
            return <MessageDisplay message="This collection does not exist or you don't have sufficient permissions to view it." variant="h6" />;
        }

        return (
            <>
                <FileList
                    selectionEnabled
                    files={filesWithSelectionState}
                    onPathCheckboxClick={this.handlePathCheckboxClick}
                    onPathHighlight={this.handlePathHighlight}
                    onPathDoubleClick={this.handlePathDoubleClick}
                    onAllSelection={allSelectionChangeHandler}
                />
                <div style={{marginTop: 8}}>
                    <FileOperations
                        openedCollection={openedCollection}
                        openedPath={openedPath}
                        disabled={!openedCollection.canWrite}
                        existingFiles={files ? files.map(file => file.basename) : []}
                        getDownloadLink={FileAPI.getDownloadLink}
                        fetchFilesIfNeeded={fetchFilesIfNeeded}
                    />
                </div>
            </>
        );
    }
}

export default withRouter(FileBrowser);
