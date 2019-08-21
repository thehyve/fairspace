import React from 'react';
import {withStyles} from '@material-ui/core/styles';

import styles from './FileOperationsGroup.styles';

export const FileOperationsGroup = ({classes, children}) => (
    <div className={classes.buttonsContainer}>{children}</div>
);

export default withStyles(styles)(FileOperationsGroup);
