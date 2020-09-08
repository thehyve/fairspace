import React, {useContext} from 'react';
import {Link, ListItemText, Paper, Table, TableBody, TableCell, TableHead, TableRow, Tooltip, Typography, withStyles} from '@material-ui/core';

import {Link as RouterLink} from 'react-router-dom';
import {FolderOpenOutlined, FolderOutlined, InsertDriveFileOutlined} from '@material-ui/icons';
import {getCollectionAbsolutePath, handleCollectionSearchRedirect} from './collectionUtils';
import {COLLECTION_URI, DIRECTORY_URI, FILE_URI, SEARCH_MAX_SIZE} from "../constants";
import VocabularyContext, {VocabularyProvider} from '../metadata/vocabulary/VocabularyContext';
import {getLabelForType, typeShapeWithProperties} from '../metadata/common/vocabularyUtils';
import useAsync from "../common/hooks/UseAsync";
import {getSearchQueryFromString, handleSearchError, renderSearchResultProperty} from "../search/searchUtils";
import SearchAPI, {SORT_DATE_CREATED} from "../search/SearchAPI";
import SearchResultHighlights from "../search/SearchResultHighlights";
import SearchBar from "../search/SearchBar";
import LoadingInlay from "../common/components/LoadingInlay";
import MessageDisplay from "../common/components/MessageDisplay";
import {getParentPath} from '../file/fileUtils';

const styles = {
    tableRoot: {
        width: '100%',
        maxHeight: 'calc(100% - 60px)',
        overflowX: 'auto',
        marginTop: 16
    },
    table: {
        minWidth: 700,
    },
    search: {
        width: '80%',
        margin: 10
    }
};

const COLLECTION_DIRECTORIES_FILES = [DIRECTORY_URI, FILE_URI, COLLECTION_URI];

const CollectionSearchResultList = ({classes, items, total, loading, error, history, vocabulary}) => {
    const pathForIri = (iri: string) => {
        const path = decodeURIComponent(new URL(iri).pathname);
        return path.replace('/api/v1/webdav/', '');
    };

    const renderType = (item) => {
        if (!item.type && item.type.length === 0) {
            return null;
        }
        const typeLabel = getLabelForType(vocabulary, item.type[0]);
        let avatar;
        switch (typeLabel) {
            case 'Collection':
                avatar = <FolderOutlined />;
                break;
            case 'Directory':
                avatar = <FolderOpenOutlined />;
                break;
            case 'File':
                avatar = <InsertDriveFileOutlined />;
                break;
            default:
                avatar = null;
        }
        if (avatar) {
            return (
                <>
                    <Tooltip title={typeLabel} arrow>
                        {avatar}
                    </Tooltip>
                    <Typography variant="srOnly">{typeLabel}</Typography>
                </>
            );
        }
        return <Typography>{typeLabel}</Typography>;
    };

    const link = (item) => {
        const path = pathForIri(item.iri);
        if (item.type && item.type.length > 0 && item.type[0] === FILE_URI) {
            const parentPath = getParentPath(path);
            return `${getCollectionAbsolutePath(parentPath)}?selection=${encodeURIComponent(`/${path}`)}`;
        }
        return getCollectionAbsolutePath(path);
    };

    /**
     * Handles a click on a search result.
     * @param item The clicked search result.
     */
    const handleResultDoubleClick = (item) => {
        history.push(link(item));
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
                        <TableCell />
                        <TableCell />
                        <TableCell>Path</TableCell>
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
                                <TableCell width={30}>
                                    {renderType(item)}
                                </TableCell>
                                <TableCell>
                                    <ListItemText
                                        primary={renderSearchResultProperty(item, 'label')}
                                        secondary={renderSearchResultProperty(item, 'comment')}
                                    />
                                </TableCell>
                                <TableCell>
                                    <Link
                                        to={link(item)}
                                        component={RouterLink}
                                        color="inherit"
                                        underline="hover"
                                    >
                                        {pathForIri(item.iri)}
                                    </Link>
                                </TableCell>
                                <TableCell>
                                    <SearchResultHighlights
                                        highlights={item.highlights}
                                        typeShape={typeShapeWithProperties(vocabulary, item.type)}
                                    />
                                </TableCell>
                            </TableRow>
                        ))}
                </TableBody>
            </Table>
        </Paper>
    );
};

// This separation/wrapping of components is mostly for unit testing purposes (much harder if it's 1 component)
export const CollectionSearchResultListContainer = ({
    location: {search}, query = getSearchQueryFromString(search),
    vocabulary, vocabularyLoading, vocabularyError,
    classes, history, searchFunction = SearchAPI.search
}) => {
    const {data, loading, error} = useAsync(() => searchFunction(({query, types: COLLECTION_DIRECTORIES_FILES, size: SEARCH_MAX_SIZE, sort: SORT_DATE_CREATED}))
        .catch(handleSearchError), [search, query, searchFunction]);
    const items = data ? data.items : [];
    const total = data ? data.total : 0;
    const handleSearch = (value) => {
        handleCollectionSearchRedirect(history, value);
    };

    return (
        <div>
            <SearchBar
                placeholder="Search"
                disableUnderline={false}
                onSearchChange={handleSearch}
                query={query}
            />
            <CollectionSearchResultList
                items={items}
                total={total}
                loading={loading || vocabularyLoading}
                error={vocabularyError || error}
                classes={classes}
                history={history}
                vocabulary={vocabulary}
            />
        </div>
    );
};

const CollectionSearchResultListWithVocabulary = (props) => {
    const {vocabulary, vocabularyLoading, vocabularyError} = useContext(VocabularyContext);

    return (
        <VocabularyProvider>
            <CollectionSearchResultListContainer
                {...props}
                vocabulary={vocabulary}
                vocabularyLoading={vocabularyLoading}
                vocabularyError={vocabularyError}
            />
        </VocabularyProvider>
    );
};

export default withStyles(styles)(CollectionSearchResultListWithVocabulary);
