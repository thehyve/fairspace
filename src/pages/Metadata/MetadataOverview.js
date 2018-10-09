import React from 'react';
import Typography from "@material-ui/core/Typography";
import TextField from "@material-ui/core/TextField";
import Paper from "@material-ui/core/Paper";
import MetadataEntities from "../../components/metadata/MetadataEntities";

const MetadataOverview = () => (
    <div>
        <Typography variant={"title"} paragraph>{'Metadata'}</Typography>

        <TextField
            disabled
            placeholder={'Search'}
        />

        <Paper>
            <MetadataEntities/>
        </Paper>

    </div>
);

export default MetadataOverview;



