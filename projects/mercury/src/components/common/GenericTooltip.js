import Tooltip from "@material-ui/core/Tooltip";
import React from "react";
import {withStyles} from "@material-ui/core";

const styles = theme => ({
    tooltip: {
        ...theme.typography.caption,
        maxWidth: 'none',
        color: 'white'
    }
});

export default withStyles(styles)(
    ({classes, children, ...otherProps}) => (<Tooltip classes={classes} {...otherProps}>{children}</Tooltip>)
);
