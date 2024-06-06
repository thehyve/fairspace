import React from 'react';
import PropTypes from 'prop-types';
import CircularProgress from '@mui/material/CircularProgress';

const ProgressButton = ({active, children, size = 28}) =>
    active ? (
        <div style={{display: 'inline-flex', margin: 10}}>
            <CircularProgress
                style={{
                    alignSelf: 'center'
                }}
                size={size}
            />
        </div>
    ) : (
        children
    );

ProgressButton.propTypes = {
    active: PropTypes.bool
};

export default ProgressButton;
