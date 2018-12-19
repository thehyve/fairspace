import React from 'react';
import PropTypes from 'prop-types';
import Menu from "@material-ui/core/Menu";

const moreActionsMenu = (props) => (
    <Menu
        id="more-menu"
        anchorEl={props.anchorEl}
        open={Boolean(props.anchorEl)}
        onClose={props.onClose}
    >
        {props.menuItems}
    </Menu>
);

moreActionsMenu.propTypes = {
    classes: PropTypes.object,
    menuItems: PropTypes.array,
    anchorEl: PropTypes.object,
    onClose: PropTypes.func,
};

export default moreActionsMenu;
