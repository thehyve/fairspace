import React, {useContext} from 'react';
import {withRouter} from 'react-router-dom';
import {
    Checkbox, FormControl, Input, ListItemText, MenuItem, Paper, Select, TableFooter, TablePagination, TableRow,
    withStyles
} from "@material-ui/core";

import {LoadingInlay, MessageDisplay, SearchBar} from "../../common";
import BreadCrumbs from "../../common/breadcrumbs/BreadCrumbs";
import useLinkedDataSearch from '../UseLinkedDataSearch';
import LinkedDataCreator from "./LinkedDataCreator";
import LinkedDataList from './LinkedDataList';
import LinkedDataContext from '../LinkedDataContext';

const styles = theme => ({
    typeSelect: {
        paddingLeft: theme.spacing.unit * 10
    }
});

const getEntityRelativeUrl = (editorPath, id) => `${editorPath}?iri=` + encodeURIComponent(id)

const LinkedDataListPage = ({classes, history}) => {
    const {
        query, types, shapes, size, page, shapesLoading, loading, error, onSearchChange,
        onTypesChange, onPageChange, onSizeChange, allTypes, entities, total, hasHighlights,
    } = useLinkedDataSearch(true);

    const {
        requireIdentifier, editorPath, createLinkedDataEntity,
        onEntityCreationError, hasEditRight, typeRender
    } = useContext(LinkedDataContext);

    const renderTypeClass = ({targetClass, label}) => (
        <MenuItem key={targetClass} value={targetClass}>
            <Checkbox checked={types.includes(targetClass)} />
            <ListItemText primary={label} secondary={targetClass} />
        </MenuItem>
    );

    const footerRender = ({count, colSpan}) => (
        <TableFooter>
            <TableRow>
                <TablePagination
                    rowsPerPageOptions={[5, 10, 25]}
                    rowsPerPage={size}
                    colSpan={colSpan}
                    count={count}
                    page={page}
                    onChangePage={(_, p) => onPageChange(p)}
                    onChangeRowsPerPage={(e) => onSizeChange(e.target.value)}
                />
            </TableRow>
        </TableFooter>
    );

    const ListBody = () => {
        if (loading) {
            return <LoadingInlay />;
        }

        if (error) {
            return <MessageDisplay message={error.message || 'An error occurred while loading metadata'} />;
        }

        if (entities && entities.length > 0) {
            return (
                <LinkedDataList
                    items={entities}
                    total={total}
                    hasHighlights={hasHighlights}
                    footerRender={footerRender}
                    typeRender={typeRender}
                    onOpen={(id) => history.push(getEntityRelativeUrl(editorPath, id))}
                />
            );
        }

        return <MessageDisplay message={query && query !== '*' ? 'No results found' : 'The metadata is empty'} isError={false} />;
    };

    const getTypeLabel = (type) => allTypes.find(({targetClass}) => targetClass === type).label;

    return (
        <>
            <BreadCrumbs />
            <Paper>
                <SearchBar
                    placeholder="Search"
                    disableUnderline
                    onSearchChange={onSearchChange}
                />
                <FormControl className={classes.typeSelect}>
                    <Select
                        multiple
                        displayEmpty
                        value={types}
                        onChange={e => onTypesChange(e.target.value)}
                        input={<Input id="select-multiple-checkbox" />}
                        renderValue={selected => (selected.length === 0 ? '[All types]' : selected.map(getTypeLabel).join(', '))}
                    >
                        {allTypes.map(renderTypeClass)}
                    </Select>
                </FormControl>
            </Paper>
            {
                hasEditRight ? (
                    <LinkedDataCreator
                        shapesLoading={shapesLoading}
                        shapes={shapes}
                        requireIdentifie={requireIdentifier}
                        create={
                            (formKey, id, type) => createLinkedDataEntity(formKey, id, type)
                                .then(() => history.push(getEntityRelativeUrl(editorPath, id)))
                        }
                        onEntityCreationError={onEntityCreationError}
                    >
                        <ListBody />
                    </LinkedDataCreator>
                ) : <ListBody />
            }

        </>
    );
};

export default withRouter(withStyles(styles)(LinkedDataListPage));
