import React from 'react';
import Dropdown from "./Dropdown";

function EnumerationDropdown(props) {
    return (
        <Dropdown
            entities={props.property.allowedValues}
            {...props}
        />
    );
}

export default EnumerationDropdown;
