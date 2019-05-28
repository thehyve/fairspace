import React from 'react';
import {
    withStyles, Paper, Select, MenuItem, FormControl,
    Checkbox, ListItemText, Input
} from "@material-ui/core";

import SearchBar from "../../common/SearchBar";
import BreadCrumbs from "../../common/BreadCrumbs";

const styles = theme => ({
    typeSelect: {
        paddingLeft: theme.spacing.unit * 10
    }
});

const LinkedDataListPage = ({
    classes, listRenderer, types, onSearchChange, onTypesChange, selectedTypes
}) => {
    const renderTypeClass = ({type, label}) => (
        <MenuItem key={type} value={type}>
            <Checkbox checked={selectedTypes.includes(type)} />
            <ListItemText primary={label} secondary={type} />
        </MenuItem>
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
                        value={selectedTypes}
                        onChange={e => onTypesChange(e.target.value)}
                        input={<Input id="select-multiple-checkbox" />}
                        renderValue={selected => (selected.length === 0 ? '[All types]'
                            : types.filter(({type}) => selected.includes(type)).map(({label}) => label)
                                .join(', '))}
                    >
                        {types.map(renderTypeClass)}
                    </Select>
                </FormControl>
            </Paper>
            {listRenderer()}
        </>
    );
};

export default withStyles(styles)(LinkedDataListPage);
