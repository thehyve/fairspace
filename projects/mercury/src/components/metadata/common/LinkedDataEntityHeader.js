import React from 'react';
import {Grid, Typography, Chip, Tooltip, Divider} from "@material-ui/core";

const linkedDataEntityHeader = ({header, label, description, error}) => !error && (
    <>
        <Grid container justify="space-between">
            <Grid item>
                <Typography variant="h5">
                    {header}
                </Typography>
            </Grid>
            <Grid item>
                <Tooltip
                    title={(
                        <Typography
                            variant="caption"
                            color="inherit"
                            style={{whiteSpace: 'pre-line'}}
                        >
                            {description}
                        </Typography>
                    )}
                    aria-label={description}
                >
                    <Chip label={label || '........'} />
                </Tooltip>
            </Grid>
        </Grid>
        <Divider style={{marginTop: 16}} />
    </>
);

export default linkedDataEntityHeader;
