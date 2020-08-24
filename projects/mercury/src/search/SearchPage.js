import React from 'react';
import {Paper, Table, TableBody, TableCell, TableHead, TableRow, withStyles} from '@material-ui/core';
import {workspacePrefix} from "../workspaces/workspaces";
import crossWorkspacesSearchAPI from "./CrossWorkspacesSearchAPI";
import {METADATA_PATH, WORKSPACE_URI} from "../constants";
import useAsync from "../common/hooks/UseAsync";
import {getSearchQueryFromString, handleSearchError} from "./searchUtils";
import LoadingInlay from "../common/components/LoadingInlay";
import MessageDisplay from "../common/components/MessageDisplay";

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

export const SearchPage = ({classes, items = [], loading, error, history}) => {
    const getEntityRelativeUrl = ({index, id, type}) => {
        if (type === WORKSPACE_URI) {
            return workspacePrefix(index);
        }
        return `${METADATA_PATH}?iri=${encodeURIComponent(id)}`;
    };

    /**
     * Handles a click on a search result.
     * @param result   The clicked search result. For the format, see the ES api
     */
    const handleResultDoubleClick = (result) => {
        const navigationPath = getEntityRelativeUrl(result);
        history.push(navigationPath);
    };

    if (loading) {
        return <LoadingInlay />;
    }

    if (!loading && error && error.message) {
        return <MessageDisplay message={error.message} />;
    }

    if (items.length === 0) {
        return <MessageDisplay message="No results found!" isError={false} />;
    }

    return (
        <Paper className={classes.tableRoot} data-testid="results-table">
            <Table className={classes.table}>
                <TableHead>
                    <TableRow>
                        <TableCell>Workspace</TableCell>
                        <TableCell>Label</TableCell>
                        <TableCell>Type</TableCell>
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
                                    {item.index}
                                </TableCell>
                                <TableCell>
                                    {item.label}
                                </TableCell>
                                <TableCell>
                                    {item.type}
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
    classes, history, searchFunction = crossWorkspacesSearchAPI.search
}) => {
    const {data, loading, error} = useAsync(() => searchFunction(({query})).catch(handleSearchError), [search, query, searchFunction]);

    return (
        <SearchPage
            items={data}
            loading={loading}
            error={error}
            classes={classes}
            history={history}
        />
    );
};

export default withStyles(styles)(SearchPageContainer);
