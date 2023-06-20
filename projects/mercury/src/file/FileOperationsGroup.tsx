// @ts-nocheck
import React from "react";
import withStyles from "@mui/styles/withStyles";
import styles from "./FileOperationsGroup.styles";
export const FileOperationsGroup = ({
  classes,
  children
}) => <div className={classes.buttonsContainer}>{children}</div>;
export default withStyles(styles)(FileOperationsGroup);