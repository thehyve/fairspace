import React from 'react';
import {Checkbox, Chip, Grid, Input, ListItemText, MenuItem, Select, withStyles} from "@material-ui/core";

import {SearchBar} from "../../common/components";

const styles = theme => ({
    chips: {
        display: 'flex',
        flexWrap: 'wrap',
    },
    chip: {
        margin: theme.spacing.unit / 4,
    }
});

const LinkedDataListHeader = ({classes, setQuery, selectedTypes, setSelectedTypes, availableTypes}) => {
    const getTypeLabel = (type) => availableTypes.find(({targetClass}) => targetClass === type).label;

    return (
        <Grid style={{minHeight: 60}} container alignItems="center" justify="space-evenly">
            <Grid xs={6} item>
                <SearchBar
                    placeholder="Search"
                    disableUnderline={false}
                    onSearchChange={setQuery}
                />
            </Grid>
            <Grid xs={5} item>
                <Select
                    multiple
                    displayEmpty
                    value={selectedTypes}
                    onChange={e => setSelectedTypes(e.target.value)}
                    input={<Input fullWidth disableUnderline style={{margin: '8px 0'}} />}
                    renderValue={selected => (selected.length === 0 ? 'Types' : (
                        <div className={classes.chips}>
                            {selected.map(value => <Chip key={value} label={getTypeLabel(value)} className={classes.chip} />)}
                        </div>
                    ))}
                >
                    {availableTypes.map(({targetClass, label}) => (
                        <MenuItem key={targetClass} value={targetClass}>
                            <Checkbox checked={selectedTypes.includes(targetClass)} />
                            <ListItemText primary={label} secondary={targetClass} />
                        </MenuItem>
                    ))}
                </Select>
            </Grid>
        </Grid>
    );
};

export default withStyles(styles)(LinkedDataListHeader);
