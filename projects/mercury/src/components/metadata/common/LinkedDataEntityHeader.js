import React from 'react';
import {Paper, Typography} from "@material-ui/core";

const linkedDataEntityHeader = ({label, typeInfo}) => (
    <Paper style={{padding: 20}}>
        <Typography variant="h6">
            {label}
        </Typography>
        <Typography variant="h6">
            {typeInfo}
        </Typography>
    </Paper>
);

export default linkedDataEntityHeader;
