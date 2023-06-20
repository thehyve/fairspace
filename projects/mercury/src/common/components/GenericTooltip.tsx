// @ts-nocheck
import Tooltip from "@mui/material/Tooltip";
import React from "react";
import withStyles from "@mui/styles/withStyles";

const styles = theme => ({
  tooltip: { ...theme.typography.caption,
    maxWidth: 'none',
    color: 'white'
  }
});

export default withStyles(styles)(({
  classes,
  children,
  ...otherProps
}) => <Tooltip classes={classes} {...otherProps}>{children}</Tooltip>);