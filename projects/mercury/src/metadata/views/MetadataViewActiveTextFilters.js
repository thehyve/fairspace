import React from 'react';
import {Chip, Divider, Grid, IconButton, Typography} from '@mui/material';
import withStyles from '@mui/styles/withStyles';
import {Close} from "@mui/icons-material";
import type {MetadataViewColumn} from "./MetadataViewAPI";

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
    textFiltersObject: Object;
    setTextFiltersObject: () => {};
    columns: MetadataViewColumn[];
    classes: any;
};

export const MetadataViewActiveTextFilters = (props: MetadataViewActiveTextFiltersProperties) => {
    const {textFiltersObject, setTextFiltersObject, columns, classes} = props;

    if (Object.values(textFiltersObject).every(v => v === null || v === "")) {
        return <></>;
    }

    const clearTextFilters = () => {
        setTextFiltersObject({});
    };

    const clearSingleTextFilter = (field: string) => {
        delete textFiltersObject[field];
        setTextFiltersObject({...textFiltersObject});
    };

    return (
        <div>
            <Grid
                container
                direction="row"
                justifyContent="flex-start"
                alignItems="center"
                spacing={1}
                className={classes.activeTextFiltersBox}
            >
                <Grid container item xs>
                    <Grid key="activeTextFilters" item>
                        <Typography variant="overline" component="span" color="textSecondary">Active text filters: </Typography>
                    </Grid>
                    {Object.entries(textFiltersObject).filter(([, value]) => value !== null && value !== "")
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
                    <IconButton
                        onClick={clearTextFilters}
                        title="Clear text filters"
                        className={classes.clearButton}
                        size="large"
                    >
                        <Close color="error" />
                    </IconButton>
                </Grid>
            </Grid>
            <Divider classes={{root: classes.divider}} />
        </div>
    );
};

export default withStyles(styles)(MetadataViewActiveTextFilters);
