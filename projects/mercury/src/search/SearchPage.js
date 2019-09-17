import React, {useEffect} from 'react';
import PropTypes from "prop-types";
import {connect} from 'react-redux';
import {
    Paper, Table, TableBody,
    TableCell, TableHead, TableRow
} from '@material-ui/core';
import {LoadingInlay, MessageDisplay} from '@fairspace/shared-frontend';

import SearchResultHighlights from "./SearchResultHighlights";
import {getSearchQueryFromString} from '../common/utils/searchUtils';
import {getCollectionAbsolutePath} from '../common/utils/collectionUtils';
import {getParentPath} from '../common/utils/fileUtils';
import {searchCollections} from '../common/redux/actions/searchActions';
import * as vocabularyActions from '../common/redux/actions/vocabularyActions';
import * as collectionBrowserActions from "../common/redux/actions/collectionBrowserActions";
import {COLLECTION_URI, DIRECTORY_URI, FILE_URI} from "../constants";
import {getVocabulary, isVocabularyPending} from "../common/redux/reducers/cache/vocabularyReducers";
import {getCollectionsSearchResults} from "../common/redux/reducers/searchReducers";

// Exporting here to be able to test the component outside of Redux
export const SearchPage = ({
    location: {search}, query = getSearchQueryFromString(search), performSearch, fetchVocabularyIfNeeded,
    history, selectPath, deselectAllPaths, results, vocabulary, loading, error
}) => {
    useEffect(() => {
        fetchVocabularyIfNeeded();
        performSearch(query);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [search, query]);

    const getPathOfResult = ({type, filePath}) => {
        switch (type[0]) {
            case COLLECTION_URI:
            case DIRECTORY_URI:
                return filePath[0];
            case FILE_URI:
                return getParentPath(filePath[0]);
            default:
                // TODO: handle metadata open. Out of scope for now
                return '';
        }
    };

    // If vocabulary has not been loaded, we can not
    // retrieve the label. Just return the URI in that (rare) case
    const generateTypeLabel = (typeUri) => (vocabulary ? vocabulary.getLabelForPredicate(typeUri) : typeUri);

    /**
     * Handles a click on a search result.
     * @param result   The clicked search result. For the format, see the ES api
     */
    const handleResultDoubleClick = (result) => {
        const navigationPath = getCollectionAbsolutePath(getPathOfResult(result));

        history.push(navigationPath);
        deselectAllPaths();
        selectPath('/' + result.filePath);
    };

    if (loading) {
        return <LoadingInlay />;
    }

    if (!loading && error && error.message) {
        return <MessageDisplay message={error.message} />;
    }

    if (!results || results.total === 0) {
        return <MessageDisplay message="No results found!" isError={false} />;
    }

    return (
        <Paper style={{width: '100%'}} data-testid="results-table">
            <Table padding="dense">
                <TableHead>
                    <TableRow>
                        <TableCell>Label</TableCell>
                        <TableCell>Type</TableCell>
                        <TableCell>Description</TableCell>
                        <TableCell>Match</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {results.items
                        .map((item) => (
                            <TableRow
                                hover
                                key={item.id}
                                onDoubleClick={() => handleResultDoubleClick(item)}
                            >
                                <TableCell>
                                    {item.label}
                                </TableCell>
                                <TableCell>
                                    {generateTypeLabel(item.type)}
                                </TableCell>
                                <TableCell>
                                    {item.comment}
                                </TableCell>
                                <TableCell>
                                    <SearchResultHighlights highlights={item.highlights} />
                                </TableCell>
                            </TableRow>
                        ))}
                </TableBody>
            </Table>
        </Paper>
    );
};

const mapStateToProps = (state) => {
    const results = getCollectionsSearchResults(state);
    const loading = results.pending || isVocabularyPending(state);
    const vocabulary = getVocabulary(state);

    return {
        loading,
        results,
        error: results.error,
        vocabulary
    };
};

const mapDispatchToProps = {
    performSearch: searchCollections,
    fetchVocabularyIfNeeded: vocabularyActions.fetchMetadataVocabularyIfNeeded,
    selectPath: collectionBrowserActions.selectPath,
    deselectAllPaths: collectionBrowserActions.deselectAllPaths
};

SearchPage.propTypes = {
    location: PropTypes.shape({
        search: PropTypes.string.isRequired
    }),
    performSearch: PropTypes.func.isRequired,
    fetchVocabularyIfNeeded: PropTypes.func.isRequired
};

export default connect(mapStateToProps, mapDispatchToProps)(SearchPage);
