import React, {useState} from 'react';
import {
    withStyles, Paper, Select, MenuItem, FormControl,
    Checkbox, ListItemText, Input
} from "@material-ui/core";

import SearchBar from "../../common/SearchBar";
import BreadCrumbs from "../../common/BreadCrumbs";
import {getFirstPredicateId} from "../../../utils/linkeddata/jsonLdUtils";
import * as constants from "../../../constants";
import {getLabel} from "../../../utils/linkeddata/metadataUtils";

const styles = theme => ({
    typeSelect: {
        paddingLeft: theme.spacing.unit * 10
    }
});

const LinkedDataListPage = ({
    classes, listRenderer, classesInCatalog, performSearch
}) => {
    const [selectedTypes, setSelectedTypes] = useState([]);
    const [query, setQuery] = useState('');

    const allTypes = classesInCatalog.map(type => {
        const targetClass = getFirstPredicateId(type, constants.SHACL_TARGET_CLASS);
        const label = getLabel(type);
        return {targetClass, label};
    })

    const labelMap = {};
    allTypes.forEach(({targetClass, label}) => labelMap[targetClass] = label);

    const renderTypeClass = ({targetClass, label}) => (
        <MenuItem key={targetClass} value={targetClass}>
            <Checkbox checked={selectedTypes.includes(targetClass)} />
            <ListItemText primary={label} secondary={targetClass} />
        </MenuItem>
    );

    const onSearchChange = q => {
        setQuery(q);
        performSearch(q, selectedTypes);
    };

    const onTypesChange = types => {
        setSelectedTypes(types);
        performSearch(query, types);
    };

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
                        value={selectedTypes}
                        onChange={e => onTypesChange(e.target.value)}
                        input={<Input id="select-multiple-checkbox" />}
                        renderValue={selected => (selected.length === 0 ? '[All types]'
                            : selected.map(targetClass => labelMap[targetClass]).join(', '))}
                    >
                        {allTypes.map(renderTypeClass)}
                    </Select>
                </FormControl>
            </Paper>
            {listRenderer()}
        </>
    );
};

export default withStyles(styles)(LinkedDataListPage);
