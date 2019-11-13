import React, {useEffect, useState} from 'react';
import {connect} from 'react-redux';
import {
    Paper, Table, TableBody,
    TableCell, TableHead, TableRow, withStyles
} from '@material-ui/core';
import {LoadingInlay, MessageDisplay, SearchResultHighlights, getSearchQueryFromString, SORT_DATE_CREATED, handleSearchError, SearchAPI} from '@fairspace/shared-frontend';

import {getCollectionAbsolutePath} from '../common/utils/collectionUtils';
import {getParentPath} from '../common/utils/fileUtils';
import * as vocabularyActions from '../common/redux/actions/vocabularyActions';
import {COLLECTION_URI, DIRECTORY_URI, FILE_URI, ES_INDEX, SEARCH_MAX_SIZE} from "../constants";
import {getVocabulary, isVocabularyPending} from "../common/redux/reducers/cache/vocabularyReducers";
import Config from '../common/services/Config';

const styles = {
    tableRoot: {
        width: '100%',
        maxHeight: 'calc(100% - 60px)',
        overflowX: 'auto'
    },
    table: {
        minWidth: 700,
    }
};

const COLLECTION_DIRECTORIES_FILES = [DIRECTORY_URI, FILE_URI, COLLECTION_URI];

export const SearchPage = ({classes, items, total, loading, error, history, vocabulary}) => {
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
        const selectionQueryString = "?selection=" + encodeURIComponent('/' + result.filePath);

        history.push(navigationPath + selectionQueryString);
    };

    if (loading) {
        return <LoadingInlay />;
    }

    if (!loading && error && error.message) {
        return <MessageDisplay message={error.message} />;
    }

    if (!total || total === 0) {
        return <MessageDisplay message="No results found!" isError={false} />;
    }

    return (
        <Paper className={classes.tableRoot} data-testid="results-table">
            <Table className={classes.table}>
                <TableHead>
                    <TableRow>
                        <TableCell>Label</TableCell>
                        <TableCell>Type</TableCell>
                        <TableCell>Description</TableCell>
                        <TableCell>Match</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {items
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

// This separation/wrapping of compontents is mostly for unit testing purposes (much harder if it's 1 component)
export const SearchPageContainer = ({
    location: {search}, query = getSearchQueryFromString(search), vocabularyPending,
    fetchVocabularyIfNeeded, classes, history, vocabulary, searchFunction
}) => {
    const [items, setItems] = useState([]);
    const [total, setTotal] = useState();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState();

    useEffect(() => {
        fetchVocabularyIfNeeded();
        searchFunction(({query, types: COLLECTION_DIRECTORIES_FILES, size: SEARCH_MAX_SIZE, sort: SORT_DATE_CREATED}))
            .catch(handleSearchError)
            .then(data => {
                setItems(data.items);
                setTotal(data.total);
                setError(undefined);
            })
            .catch((e) => setError(e || true))
            .finally(() => setLoading(false));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [search, query]);

    return (
        <SearchPage
            items={items}
            total={total}
            loading={loading || vocabularyPending}
            error={error}
            classes={classes}
            history={history}
            vocabulary={vocabulary}
        />
    );
};

const mapStateToProps = (state) => {
    const vocabularyPending = isVocabularyPending(state);
    const vocabulary = getVocabulary(state);
    const searchFunction = SearchAPI(Config.get(), ES_INDEX).search;

    return {
        vocabularyPending,
        vocabulary,
        searchFunction
    };
};

const mapDispatchToProps = {
    fetchVocabularyIfNeeded: vocabularyActions.fetchMetadataVocabularyIfNeeded
};

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(SearchPageContainer));
