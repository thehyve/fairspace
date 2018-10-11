import React from 'react';
import PropTypes from 'prop-types';
import Menu from "@material-ui/core/Menu";

class MoreActionsMenu extends React.Component {
    render() {
        return (
            <Menu
                id="more-menu"
                anchorEl={this.props.anchorEl}
                open={Boolean(this.props.anchorEl)}
                onClose={this.props.onClose}
            >
                {this.props.menuItems}
            </Menu>
        )
    }
}

MoreActionsMenu.propTypes = {
    classes: PropTypes.object,
    menuItems: PropTypes.array,
    anchorEl: PropTypes.object,
    onClose: PropTypes.func,
};

export default MoreActionsMenu;
