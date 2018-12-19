import React from 'react';
import PropTypes from 'prop-types';
import MenuItem from "@material-ui/core/MenuItem/MenuItem";

const ActionItem = props => (
    <MenuItem onClick={props.onClick}>
        {props.children}
    </MenuItem>
);

ActionItem.propTypes = {
    onClick: PropTypes.func,
};

export default ActionItem;
