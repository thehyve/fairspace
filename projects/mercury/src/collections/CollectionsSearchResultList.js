import React from 'react';
import {Link, ListItemText, Paper, Table, TableBody, TableCell, TableHead, TableRow, Tooltip, Typography, withStyles} from '@material-ui/core';

import {Link as RouterLink} from 'react-router-dom';
import {Folder, FolderOpenOutlined, InsertDriveFileOutlined} from '@material-ui/icons';
import {getCollectionAbsolutePath, handleCollectionSearchRedirect, pathForIri} from './collectionUtils';
import {COLLECTION_URI, DIRECTORY_URI, FILE_URI} from "../constants";
import useAsync from "../common/hooks/UseAsync";
import {getSearchContextFromString, getSearchQueryFromString, handleSearchError} from "../search/searchUtils";
import SearchBar from "../search/SearchBar";
import LoadingInlay from "../common/components/LoadingInlay";
import MessageDisplay from "../common/components/MessageDisplay";
import {getParentPath} from '../file/fileUtils';
import {searchFiles} from "../search/lookup";
import BreadcrumbsContext from '../common/contexts/BreadcrumbsContext';
import BreadCrumbs from '../common/components/BreadCrumbs';

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
    },
    title: {
        margin: 10,
        marginTop: 16
    }
};

const CollectionSearchResultList = ({classes, items, total, loading, error, history}) => {
    const renderType = (item) => {
        let avatar;
        let typeLabel;
        switch (item.type) {
            case COLLECTION_URI:
                avatar = <Folder />;
                typeLabel = "Collection";
                break;
            case DIRECTORY_URI:
                avatar = <FolderOpenOutlined />;
                typeLabel = "Directory";
                break;
            case FILE_URI:
                avatar = <InsertDriveFileOutlined />;
                typeLabel = "File";
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
        const path = pathForIri(item.id);
        if (item.type && item.type === FILE_URI) {
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
                                <TableCell>{renderType(item)}</TableCell>
                                <TableCell>
                                    <ListItemText
                                        primary={item.label}
                                        secondary={item.comment}
                                    />
                                </TableCell>
                                <TableCell>
                                    <Link
                                        to={link(item)}
                                        component={RouterLink}
                                        color="inherit"
                                        underline="hover"
                                    >
                                        {pathForIri(item.id)}
                                    </Link>
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
    location: {search}, query = getSearchQueryFromString(search), context = getSearchContextFromString(search),
    classes, history
}) => {
    const {data, loading, error} = useAsync(() => searchFiles(query, context).catch(handleSearchError), [search, query]);
    const items = data || [];
    const total = items.length;
    const handleSearch = (value) => {
        handleCollectionSearchRedirect(history, value);
    };

    const pathSegments = () => {
        const segments = ((context && pathForIri(context)) || '').split('/');
        if (segments[0] === '') {
            return [];
        }
        const result = [];
        let href = '/collections';
        segments.forEach(segment => {
            href += '/' + segment;
            result.push({label: segment, href});
        });
        return result;
    };

    return (
        <BreadcrumbsContext.Provider value={{segments: [
            {
                label: 'Collections',
                icon: <Folder />,
                href: '/collections'
            }
        ]}}
        >
            <BreadCrumbs additionalSegments={pathSegments()} />
            <SearchBar
                placeholder="Search"
                disableUnderline={false}
                onSearchChange={handleSearch}
                query={query}
            />
            <Typography variant="h6" className={classes.title}>Search results</Typography>
            <CollectionSearchResultList
                items={items}
                total={total}
                loading={loading}
                error={error}
                classes={classes}
                history={history}
            />
        </BreadcrumbsContext.Provider>
    );
};

export default withStyles(styles)(CollectionSearchResultListContainer);
