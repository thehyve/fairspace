import React from 'react';
import {Typography, withStyles} from "@material-ui/core";

const styles = {
    root: {
        padding: '20px',
        borderBottom: '1px solid #eee'
    }
};

const linkedDataEntityHeader = ({label, typeInfo, classes}) => (
    <div className={classes.root}>
        <Typography variant="h6">
            {label}
        </Typography>
        <Typography variant="h6">
            {typeInfo}
        </Typography>
    </div>
);

export default withStyles(styles)(linkedDataEntityHeader);
