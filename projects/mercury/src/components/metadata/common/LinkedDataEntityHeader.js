import React from 'react';
import {Grid, Typography, Chip} from "@material-ui/core";

const linkedDataEntityHeader = ({header, label, description}) => (
    <>
        <Grid container justify="space-between">
            <Grid item>
                <Typography variant="h5">
                    {header}
                </Typography>
            </Grid>
            <Grid item>
                <Chip label={label || '........'} />
            </Grid>
        </Grid>
        <Grid container justify="flex-end" style={{margin: '4px 0'}}>
            <Grid item>
                <Typography variant="subtitle1">
                    {description}
                </Typography>
            </Grid>
        </Grid>
    </>
);

export default linkedDataEntityHeader;
