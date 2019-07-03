import React, {useState} from 'react';
import {
    Checkbox,
    FormControl,
    Input,
    ListItemText,
    MenuItem,
    Paper,
    Select,
    TableFooter,
    TablePagination,
    TableRow,
    withStyles
} from "@material-ui/core";

import SearchBar from "../../common/SearchBar";
import {getFirstPredicateId} from "../../../utils/linkeddata/jsonLdUtils";
import {SEARCH_DEFAULT_SIZE, SHACL_TARGET_CLASS} from "../../../constants";
import {getLabel} from "../../../utils/linkeddata/metadataUtils";
import BreadCrumbs from "../../common/breadcrumbs/BreadCrumbs";

const styles = theme => ({
    typeSelect: {
        paddingLeft: theme.spacing.unit * 10
    }
});

const LinkedDataListPage = ({classes, listRenderer, classesInCatalog, performSearch}) => {
    const [types, setTypes] = useState([]);
    const [query, setQuery] = useState('');
    const [size, setSize] = useState(SEARCH_DEFAULT_SIZE);
    const [page, setPage] = useState(0);

    const getSearchState = () => ({
        types,
        query,
        size,
        page
    });

    const allTypes = classesInCatalog.map(type => {
        const targetClass = getFirstPredicateId(type, SHACL_TARGET_CLASS);
        const label = getLabel(type);
        return {targetClass, label};
    });

    const getTypeLabel = (type) => allTypes.find(({targetClass}) => targetClass === type).label;

    const renderTypeClass = ({targetClass, label}) => (
        <MenuItem key={targetClass} value={targetClass}>
            <Checkbox checked={types.includes(targetClass)} />
            <ListItemText primary={label} secondary={targetClass} />
        </MenuItem>
    );

    const onSearchChange = (q) => {
        setQuery(q);
        setPage(0); // reset page to start from first page
        performSearch({...getSearchState(), page: 0, query: q});
    };

    const onTypesChange = (t) => {
        setTypes(t);
        performSearch({...getSearchState(), types: t});
    };

    const onPageChange = (_, p) => {
        setPage(p);
        performSearch({...getSearchState(), page: p});
    };

    const onSizeChange = (e) => {
        const s = e.target.value;
        setSize(s);
        setPage(0); // reset page to start from first page
        performSearch({...getSearchState(), page: 0, size: s});
    };

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
            {listRenderer(footerRender)}
        </>
    );
};

export default withStyles(styles)(LinkedDataListPage);
