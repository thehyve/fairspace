import React from 'react';
import PropTypes from 'prop-types';
import MenuItem from "@material-ui/core/MenuItem";

class ActionItem extends React.Component {
    render() {
        return <MenuItem onClick={this.props.onClick}>{this.props.children}</MenuItem>
    }
}

ActionItem.propTypes = {
    onClick: PropTypes.func,
    label: PropTypes.string,
};

export default ActionItem;
