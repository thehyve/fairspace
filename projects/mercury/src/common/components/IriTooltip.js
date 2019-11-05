import React from "react";
import {withStyles, Tooltip} from "@material-ui/core";

const styles = theme => ({
    tooltip: {
        ...theme.typography.caption,
        maxWidth: 'none',
        whiteSpace: 'nowrap',
        color: 'white'
    }
});

// This is to avoid the warning similar to: Invalid prop component supplied to ComponentName. Expected an element type that can hold a ref.
const IriTooltip = React.forwardRef(({classes, children, ...otherProps}, ref) => (<Tooltip ref={ref} classes={classes} {...otherProps}>{children}</Tooltip>));

export default withStyles(styles)(IriTooltip);
