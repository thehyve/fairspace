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
import * as consts from '../../constants';

class FilesPage extends React.Component {
    componentDidMount() {
        const {
            fetchCollectionsIfNeeded, selectCollection, fetchFilesIfNeeded, openedCollection, openedPath
        } = this.props;
        fetchCollectionsIfNeeded();
        selectCollection(openedCollection.iri);

        // If the collection has not been fetched yet,
        // do not bother fetching the files
        if (openedCollection.iri) {
            fetchFilesIfNeeded(openedCollection, openedPath);
        }
    }

    componentDidUpdate(prevProps) {
        const {
            selectCollection, fetchFilesIfNeeded, openedCollection, openedPath, openPath
        } = this.props;

        if (prevProps.openedCollection.iri !== openedCollection.iri) {
            selectCollection(openedCollection.iri);
        }

        const hasCollectionDetails = openedCollection.iri;
        const hasNewOpenedCollection = prevProps.openedCollection.iri !== openedCollection.iri;
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
            {segment: openedCollection.location, label: openedCollection.name}
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
            const {
                openedCollection, fetchFilesIfNeeded,
                openPath,
                openedPath, files, selectedPaths, selectPath, deselectPath, renameFile, deleteFile
            } = this.props;

            return (
                <>
                    {this.renderBreadcrumbs()}
                    <Grid container spacing={8}>
                        <Grid item style={{width: consts.MAIN_CONTENT_WIDTH}}>
                            <FileBrowser
                                openPath={openPath}
                                fetchFilesIfNeeded={fetchFilesIfNeeded}
                                openedCollection={openedCollection}
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
    const openedCollectionLocation = params.collection;
    const openedPath = params.path ? `/${params.path}` : '/';

    const collection = (state.cache.collections.data && state.cache.collections.data.find(c => c.location === openedCollectionLocation)) || {};
    const filesPerCollection = state.cache.filesByCollectionAndPath[collection.iri] || [];
    const files = filesPerCollection[openedPath] || [];

    return {
        loading: files.pending || state.cache.collections.pending || state.cache.collections.data.length === 0,
        error: files.error || state.cache.collections.error,
        files: files.data,
        selectedPaths: state.collectionBrowser.selectedPaths,
        openedCollection: collection,
        openedCollectionId: collection.iri,
        openedPath
    };
};

const mapDispatchToProps = {
    ...collectionActions,
    ...fileActions,
    ...collectionBrowserActions
};

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(FilesPage));
