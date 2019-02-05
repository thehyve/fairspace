import React from 'react';
import Paper from "@material-ui/core/Paper";
import {withStyles} from '@material-ui/core/styles';
import MetadataEntities from "./MetadataEntities";
import SearchBar from "../common/SearchBar";
import BreadCrumbs from "../common/BreadCrumbs";

const MetadataOverviewPage = ({classes}) => (
    <>
        <BreadCrumbs />

        <Paper className={classes.searchBar}>
            <SearchBar
                placeholder="Search"
                disabled
                disableUnderline
            />
        </Paper>

        <Paper className={classes.entities}>
            <MetadataEntities />
        </Paper>

    </>
);

const style = theme => ({
    searchBar: {
        paddingLeft: theme.spacing.unit * 2
    },
    entities: {
        marginTop: theme.spacing.unit * 2,
    }
});

export default withStyles(style)(MetadataOverviewPage);
