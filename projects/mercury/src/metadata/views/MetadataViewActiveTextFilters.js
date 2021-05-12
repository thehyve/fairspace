import React from 'react';
import {Chip, Divider, Grid, IconButton, Typography, withStyles} from '@material-ui/core';
import {Close} from "@material-ui/icons";
import type {MetadataViewColumn} from "./MetadataViewAPI";
import {getInitialTextFilterMap} from "./metadataViewUtils";

const styles = theme => ({
    activeTextFiltersBox: {
        padding: 10,
        verticalAlign: 'center'
    },
    clearButton: {
        float: 'right'
    },
    divider: {
        backgroundColor: theme.palette.primary.light
    }
});

type MetadataViewActiveTextFiltersProperties = {
    textFilterMap: Map<string, string>;
    setTextFilterMap: () => {};
    columns: MetadataViewColumn[];
    classes: any;
};

export const MetadataViewActiveTextFilters = (props: MetadataViewActiveTextFiltersProperties) => {
    const {textFilterMap, setTextFilterMap, columns, classes} = props;

    if (Object.values(textFilterMap).every(v => v === null || v === "")) {
        return <></>;
    }

    const clearTextFilters = () => {
        setTextFilterMap(getInitialTextFilterMap(columns));
    };

    const clearSingleTextFilter = (field: string) => {
        setTextFilterMap({...textFilterMap, [field]: ""});
    };

    return (
        <div>
            <Grid
                container
                direction="row"
                justify="flex-start"
                alignItems="center"
                spacing={1}
                className={classes.activeTextFiltersBox}
            >
                <Grid container item xs>
                    <Grid key="activeTextFilters" item>
                        <Typography variant="overline" component="span">Active text filters: </Typography>
                    </Grid>
                    {Object.entries(textFilterMap).filter(([, value]) => value !== null && value !== "")
                        .map(([field, value]) => (
                            <Grid key={`activeTextFilters_${field}`} item>
                                <Chip
                                    key={`chip-${field}`}
                                    label={`${columns.find(c => c.name === field).title}: ${value}`}
                                    style={{marginLeft: 5}}
                                    onDelete={() => clearSingleTextFilter(field)}
                                />
                            </Grid>
                        ))}
                </Grid>
                <Grid key="activeTextFiltersClearButton" item xs={2}>
                    <IconButton onClick={clearTextFilters} title="Clear text filters" className={classes.clearButton}>
                        <Close color="error" />
                    </IconButton>
                </Grid>
            </Grid>
            <Divider classes={{root: classes.divider}} />
        </div>
    );

};

export default withStyles(styles)(MetadataViewActiveTextFilters);
