import React from 'react';
import {withStyles} from '@material-ui/core/styles';
import classNames from 'classnames';

import styles from './FileOperationsGroup.styles';

export const FileOperationsGroup = ({classes, children}) => (
    <div className={classNames(classes.buttonsContainer, classes.buttonsGroupShadow)}>{children}</div>
);

export default withStyles(styles)(FileOperationsGroup);
