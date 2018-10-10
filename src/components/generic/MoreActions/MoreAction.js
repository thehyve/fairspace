import React from 'react';
import PropTypes from 'prop-types';
import MenuItem from "@material-ui/core/MenuItem";

class MoreAction extends React.Component {
    render() {
        return <MenuItem onClick={this.props.onClick}>{this.props.children}</MenuItem>
    }
}

MoreAction.propTypes = {
    onClick: PropTypes.func,
    label: PropTypes.string,
};

export default MoreAction;
