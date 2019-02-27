import React from 'react';
import Grid from '@material-ui/core/Grid';
import {withRouter} from "react-router-dom";
import {connect} from 'react-redux';

import FileBrowser from "./FileBrowser";
import {BreadCrumbs} from "../common";
import InformationDrawer from '../common/InformationDrawer';
import {getDirectoryFromFullpath, splitPathIntoArray} from "../../utils/fileUtils";
import * as collectionBrowserActions from "../../actions/collectionBrowserActions";
import * as fileActions from "../../actions/fileActions";
import * as collectionActions from "../../actions/collectionActions";
import * as consts from '../../constants';
import {getCollectionAbsolutePath} from "../../utils/collectionUtils";

export class FilesPage extends React.Component {
    componentDidMount() {
        const {
            fetchCollectionsIfNeeded, selectCollection, fetchFilesIfNeeded, openedCollection, openedPath
        } = this.props;
        fetchCollectionsIfNeeded();
        selectCollection(openedCollection.iri);

        // If the collection has not been fetched yet,
        // do not bother fetching the files
        if (openedCollection.iri) {
            fetchFilesIfNeeded(openedPath);
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
            fetchFilesIfNeeded(openedPath);
            openPath(openedPath);
        }
    }

    renderBreadcrumbs() {
        const {openedCollection, openedPath, loading} = this.props;

        if (loading) {
            return <BreadCrumbs />;
        }

        const segments = splitPathIntoArray(openedPath).map(segment => ({segment, label: segment}));
        segments[0].label = openedCollection.name;

        return <BreadCrumbs segments={segments} />;
    }

    handleCollectionLocationChange = (collection) => {
        const {openedPath} = this.props;

        // If the collection location changes, the URI for the current page should change as well
        this.props.history.push(`${getCollectionAbsolutePath(collection)}${getDirectoryFromFullpath(openedPath)}`);
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
                            <InformationDrawer onCollectionLocationChange={this.handleCollectionLocationChange} />
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
    const openedPath = params.path ? `/${openedCollectionLocation}/${params.path}` : `/${openedCollectionLocation}`;

    const collection = (state.cache.collections.data && state.cache.collections.data.find(c => c.location === openedCollectionLocation)) || {};
    const files = state.cache.filesByPath[openedPath] || [];

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
