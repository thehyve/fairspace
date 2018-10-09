import React from 'react';
import Typography from "@material-ui/core/Typography";
import Paper from "@material-ui/core/Paper";
import MetadataEntities from "../../components/metadata/MetadataEntities";
import SearchBar from "../../components/generic/SearchBar/SearchBar";
import {withStyles} from '@material-ui/core/styles';

const MetadataOverviewPage = ({classes}) => (
    <div>
        <Typography variant={"title"} paragraph>{'Metadata'}</Typography>

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

export default withStyles(style)(MetadataOverviewPage);



