import React from 'react';
import PropTypes from 'prop-types';
import {compareBy, MaterialReactSelect} from '@fairspace/shared-frontend';

const Dropdown = ({options, ...otherProps}) => (
    <MaterialReactSelect
        style={{width: '100%'}}
        {...otherProps}
        options={options ? options.sort(compareBy('disabled')) : options}
    />
);

Dropdown.propTypes = {
    onChange: PropTypes.func,
    options: PropTypes.array
};

export default Dropdown;
