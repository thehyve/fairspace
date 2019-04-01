import React from 'react';
import Dropdown from "./Dropdown";

function ControlledVocabularyDropdown(props) {
    return (
        <Dropdown
            entities={props.property.allowedValues}
            {...props}
        />
    );
}

export default ControlledVocabularyDropdown;
