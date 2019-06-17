import React from 'react';
import PropTypes from 'prop-types';
import CircularProgress from "@material-ui/core/CircularProgress";

const ProgressButton = ({active, children}) => (active ? (
    <CircularProgress
        style={{
            alignSelf: 'center',
            margin: 10,
        }}
        size={28}
    />
) : children);

ProgressButton.propTypes = {
    active: PropTypes.bool
};

export default ProgressButton;
