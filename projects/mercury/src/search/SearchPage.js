import React, {useContext, useEffect, useState} from 'react';
import {Paper, Table, TableBody, TableCell, TableHead, TableRow, withStyles} from '@material-ui/core';
import {
    getSearchQueryFromString,
    handleSearchError,
    LoadingInlay,
    MessageDisplay,
    SearchAPI,
    SearchResultHighlights,
    SORT_DATE_CREATED
} from '../common';

import {getCollectionAbsolutePath} from '../common/utils/collectionUtils';
import {getParentPath} from '../common/utils/fileUtils';
import {COLLECTION_URI, DIRECTORY_URI, FILE_URI, SEARCH_MAX_SIZE} from "../constants";
import VocabularyContext, {VocabularyProvider} from '../metadata/VocabularyContext';
import {getLabelForPredicate} from '../common/utils/linkeddata/vocabularyUtils';
import {currentWorkspace} from "../workspaces/workspaces";

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
    const generateTypeLabel = (typeUri) => (vocabulary ? getLabelForPredicate(vocabulary, typeUri) : typeUri);

    /**
     * Handles a click on a search result.
     * @param result   The clicked search result. For the format, see the ES api
     */
    const handleResultDoubleClick = (result) => {
        const navigationPath = getCollectionAbsolutePath(getPathOfResult(result), result.index);
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

    const showWorkspaceIndex = currentWorkspace() === '_all';

    return (
        <Paper className={classes.tableRoot} data-testid="results-table">
            <Table className={classes.table}>
                <TableHead>
                    <TableRow>
                        {showWorkspaceIndex && <TableCell>Workspace</TableCell>}
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
                                {showWorkspaceIndex && <TableCell>{item.index}</TableCell>}
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

// This separation/wrapping of components is mostly for unit testing purposes (much harder if it's 1 component)
export const SearchPageContainer = ({
    location: {search}, query = getSearchQueryFromString(search),
    vocabulary, vocabularyLoading, vocabularyError,
    classes = styles, history, searchFunction = SearchAPI.search
}) => {
    const [items, setItems] = useState([]);
    const [total, setTotal] = useState();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState();

    useEffect(() => {
        searchFunction(({query, types: COLLECTION_DIRECTORIES_FILES, size: SEARCH_MAX_SIZE, sort: SORT_DATE_CREATED}))
            .catch(handleSearchError)
            .then(data => {
                setItems(data.items);
                setTotal(data.total);
                setError(undefined);
            })
            .catch((e) => setError(e || true))
            .finally(() => setLoading(false));
    }, [search, query, searchFunction]);

    return (
        <SearchPage
            items={items}
            total={total}
            loading={loading || vocabularyLoading}
            error={vocabularyError || error}
            classes={classes}
            history={history}
            vocabulary={vocabulary}
        />
    );
};

const SearchPageWithVocabulary = (props) => {
    const {vocabulary, vocabularyLoading, vocabularyError} = useContext(VocabularyContext);

    return (
        <VocabularyProvider>
            <SearchPageContainer
                {...props}
                vocabulary={vocabulary}
                vocabularyLoading={vocabularyLoading}
                vocabularyError={vocabularyError}
            />
        </VocabularyProvider>
    );
};

export default withStyles(styles)(SearchPageWithVocabulary);
