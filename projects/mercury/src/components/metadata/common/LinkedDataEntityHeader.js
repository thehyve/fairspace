import React from 'react';
import {Grid, Typography, Chip, Tooltip} from "@material-ui/core";

const linkedDataEntityHeader = ({header, label, description}) => (
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
    </>
);

export default linkedDataEntityHeader;
