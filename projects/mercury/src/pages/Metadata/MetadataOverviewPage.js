import React from 'react';
import Paper from "@material-ui/core/Paper";
import MetadataEntities from "../../components/metadata/MetadataEntities";
import SearchBar from "../../components/generic/SearchBar/SearchBar";
import {withStyles} from '@material-ui/core/styles';
import asPage from "../../containers/asPage/asPage";
import BreadCrumbs from "../../components/generic/BreadCrumbs/BreadCrumbs";

const MetadataOverviewPage = ({classes}) => (
    <div>
        <BreadCrumbs />

        <Paper className={classes.searchBar}>
            <SearchBar
                placeholder={'Search'}
                disabled
                disableUnderline
            />
        </Paper>

        <Paper className={classes.entities}>
            <MetadataEntities/>
        </Paper>

    </div>

);

const style = (theme) => ({
    searchBar: {
        paddingLeft: theme.spacing.unit * 2
    },
    entities: {
        marginTop: theme.spacing.unit * 2,
    }
});

export default asPage(withStyles(style)(MetadataOverviewPage));



