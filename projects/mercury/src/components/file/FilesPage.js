import React from 'react';
import Grid from '@material-ui/core/Grid';
import {withRouter} from "react-router-dom";
import {connect} from 'react-redux';

import FileBrowser from "./FileBrowser";
import {BreadCrumbs} from "../common";
import InformationDrawer from '../common/InformationDrawer';
import {splitPathIntoArray} from "../../utils/fileUtils";
import * as collectionBrowserActions from "../../actions/collectionBrowserActions";
import * as fileActions from "../../actions/fileActions";
import * as collectionActions from "../../actions/collectionActions";
import * as consts from '../../constants.js';

class FilesPage extends React.Component {
    componentDidUpdate(prevProps) {
        const {
            selectCollection, fetchFilesIfNeeded, openedCollection, openedPath, openPath
        } = this.props;

        if (prevProps.openedCollection.id !== openedCollection.id) {
            selectCollection(openedCollection.id);
        }

        const hasCollectionDetails = openedCollection.id;
        const hasNewOpenedCollection = prevProps.openedCollection.id !== openedCollection.id;
        const hasNewOpenedPath = prevProps.openedPath !== openedPath;

        if (hasCollectionDetails && (hasNewOpenedCollection || hasNewOpenedPath)) {
            fetchFilesIfNeeded(openedCollection, openedPath);
            openPath(`/${openedCollection.location}${openedPath === '/' ? '' : openedPath}`);
        }
    }

    renderBreadcrumbs() {
        const {openedCollection, openedPath, loading} = this.props;

        if (loading) {
            return <BreadCrumbs />;
        }

        const segments = [
            {segment: `${openedCollection.id}`, label: openedCollection.name}
        ];

        if (openedPath) {
            const toBreadcrumb = segment => ({segment, label: segment});
            const pathParts = splitPathIntoArray(openedPath);
            segments.push(...pathParts.map(toBreadcrumb));
        }

        return <BreadCrumbs segments={segments} />;
    }

    render() {
        {
            const {openedCollection, fetchFilesIfNeeded,
                selectCollection, openPath, fetchCollectionsIfNeeded, openedCollectionId,
                openedPath, files, selectedPaths, selectPath, deselectPath, renameFile, deleteFile} = this.props;

            return (
                <>
                    {this.renderBreadcrumbs()}
                    <Grid container spacing={8}>
                        <Grid item style={{width: consts.MAIN_CONTENT_WIDTH}}>
                            <FileBrowser
                                fetchCollectionsIfNeeded={fetchCollectionsIfNeeded}
                                openPath={openPath}
                                selectCollection={selectCollection}
                                fetchFilesIfNeeded={fetchFilesIfNeeded}
                                openedCollection={openedCollection}
                                openedCollectionId={openedCollectionId}
                                openedPath={openedPath}
                                files={files}
                                selectPath={selectPath}
                                selectedPaths={selectedPaths}
                                deselectPath={deselectPath}
                                renameFile={renameFile}
                                deleteFile={deleteFile}
                            />
                        </Grid>
                        <Grid item style={{width: consts.SIDE_PANEL_WIDTH}}>
                            <InformationDrawer />
                        </Grid>
                    </Grid>
                </>
            );
        }
    }
}

const mapStateToProps = (state, ownProps) => {
    const {match: {params}} = ownProps;
    const openedCollectionId = parseInt(params.collection, 10);
    const openedPath = params.path ? `/${params.path}` : '/';
    const filesPerCollection = state.cache.filesByCollectionAndPath[openedCollectionId] || [];
    const files = filesPerCollection[openedPath] || [];
    const getCollection = collectionId => (state.cache.collections.data && state.cache.collections.data.find(collection => collection.id === collectionId)) || {};

    return {
        loading: files.pending || state.cache.collections.pending || state.cache.collections.data.length === 0,
        error: files.error || state.cache.collections.error,
        files: files.data,
        selectedPaths: state.collectionBrowser.selectedPaths,
        openedCollection: openedCollectionId ? getCollection(openedCollectionId) : {},
        openedCollectionId,
        openedPath
    };
};

const mapDispatchToProps = {
    ...collectionActions,
    ...fileActions,
    ...collectionBrowserActions
};

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(FilesPage));
