import React from 'react';
import PropTypes from 'prop-types';

class ActionItem extends React.Component {
    render() {
        return <div onClick={this.props.onClick}>{this.props.children}</div>
    }
}

ActionItem.propTypes = {
    onClick: PropTypes.func,
};

export default ActionItem;
