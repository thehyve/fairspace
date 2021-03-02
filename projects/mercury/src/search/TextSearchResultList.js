import React, {useContext} from 'react';
import {
    Link,
    ListItemText,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Tooltip,
    Typography,
    withStyles
} from '@material-ui/core';

import {Link as RouterLink} from 'react-router-dom';
import {Folder, FolderOpenOutlined, InsertDriveFileOutlined} from '@material-ui/icons';
import {getSearchPathSegments, pathForIri, redirectLink} from '../collections/collectionUtils';
import {COLLECTION_URI, DIRECTORY_URI, FILE_URI} from "../constants";
import useAsync from "../common/hooks/UseAsync";
import {
    getLocationContextFromString,
    getSearchQueryFromString,
    getStorageFromString,
    handleSearchError, handleTextSearchRedirect
} from "./searchUtils";
import SearchBar from "./SearchBar";
import LoadingInlay from "../common/components/LoadingInlay";
import MessageDisplay from "../common/components/MessageDisplay";
import BreadCrumbs from '../common/components/BreadCrumbs';
import SearchAPI, {LocalSearchAPI} from "./SearchAPI";
import ExternalStoragesContext from "../external-storage/ExternalStoragesContext";
import CollectionBreadcrumbsContextProvider from "../collections/CollectionBreadcrumbsContextProvider";
import ExternalStorageBreadcrumbsContextProvider from "../external-storage/ExternalStorageBreadcrumbsContextProvider";

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

const TextSearchResultList = ({classes, items, total, loading, error, history}) => {
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

    const link = (item) => redirectLink(item.id, item.type);

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
export const TextSearchResultListContainer = ({
    location: {search},
    query = getSearchQueryFromString(search),
    context = getLocationContextFromString(search),
    storage = getStorageFromString(search),
    classes, history
}) => {
    const {externalStorages = []} = useContext(ExternalStoragesContext);
    const currentStorage = externalStorages.find(s => s.name === storage);

    const {data, loading, error} = useAsync(() => {
        const searchAPI = currentStorage ? new SearchAPI(currentStorage.searchUrl) : LocalSearchAPI;
        return searchAPI.searchForFiles(query, context).catch(handleSearchError);
    }, [search, query, storage]);

    const items = data || [];
    const total = items.length;
    const handleSearch = (value) => {
        handleTextSearchRedirect(history, value, context, storage);
    };

    const renderTextSearchResultList = () => (
        <div>
            <BreadCrumbs additionalSegments={getSearchPathSegments(context)} />
            <SearchBar
                placeholder="Search"
                disableUnderline={false}
                onSearchChange={handleSearch}
                query={query}
            />
            <TextSearchResultList
                items={items}
                total={total}
                loading={loading}
                error={error}
                classes={classes}
                history={history}
            />
        </div>
    );

    return currentStorage ? (
        <ExternalStorageBreadcrumbsContextProvider storage={currentStorage}>
            {renderTextSearchResultList()}
        </ExternalStorageBreadcrumbsContextProvider>
    ) : (
        <CollectionBreadcrumbsContextProvider>
            {renderTextSearchResultList()}
        </CollectionBreadcrumbsContextProvider>

    );
};

export default withStyles(styles)(TextSearchResultListContainer);
