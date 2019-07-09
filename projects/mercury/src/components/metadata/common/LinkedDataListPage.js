import React from 'react';
import {
    Checkbox, FormControl, Input, ListItemText,
    MenuItem, Paper, Select, TableFooter, TablePagination,
    TableRow, withStyles
} from "@material-ui/core";

import {SearchBar, MessageDisplay} from "../../common";
import BreadCrumbs from "../../common/breadcrumbs/BreadCrumbs";
import UseLinkDataSearch from '../UseLinkDataSearch';
import LinkedDataCreator from "./LinkedDataCreator";
import LinkedDataList from './LinkedDataList';

const styles = theme => ({
    typeSelect: {
        paddingLeft: theme.spacing.unit * 10
    }
});

const LinkedDataListPage = ({classes}) => {
    const {
        types, shapes, size, page, loading, error, onSearchChange,
        onTypesChange, onPageChange, onSizeChange, getTypeLabel,
        allTypes, entities, total, hasHighlights, requireIdentifier,
    } = UseLinkDataSearch(true);

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
                    onChangePage={onPageChange}
                    onChangeRowsPerPage={onSizeChange}
                />
            </TableRow>
        </TableFooter>
    );

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
                        renderValue={selected => (selected.length === 0 ? '[All types]'
                            : selected.map(getTypeLabel).join(', '))}
                    >
                        {allTypes.map(renderTypeClass)}
                    </Select>
                </FormControl>
            </Paper>
            <LinkedDataCreator shapes={shapes} requireIdentifie={requireIdentifier}>
                {
                    entities && entities.length > 0
                        ? (
                            <LinkedDataList
                                loading={loading}
                                error={error}
                                items={entities}
                                total={total}
                                hasHighlights={hasHighlights}
                                footerRender={footerRender}
                                // TODO: don't forget
                                typeRender={entry => <a href={entry.typeUrl}> {entry.typeLabel} </a>}
                                onOpen={() => {}}
                            />
                        )
                        : <MessageDisplay message="The metadata is empty" isError={false} />
                }
            </LinkedDataCreator>
        </>
    );
};

export default withStyles(styles)(LinkedDataListPage);
