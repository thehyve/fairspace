import React from 'react';
import PropTypes from 'prop-types';

import CircularProgress from "@material-ui/core/CircularProgress";

class ProgressButton extends React.Component {
    render() {
        const {active, children} = this.props;

        return active ? <CircularProgress/> : children;
    }
}

ProgressButton.propTypes = {
    active: PropTypes.bool
};

export default ProgressButton;
