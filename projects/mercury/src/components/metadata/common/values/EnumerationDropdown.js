import React from 'react';

import Dropdown from "./Dropdown";
import {getLabel, propertyHasValue} from "../../../../utils/linkeddata/metadataUtils";

function EnumerationDropdown({property, ...otherProps}) {
    const options = property.allowedValues.map((entity) => {
        const id = entity['@id'];
        const value = entity['@value'];
        const label = getLabel(entity) || value;
        const disabled = propertyHasValue(property, {id, value});

        return {
            disabled,
            label,
            id,
            value
        };
    });

    return (
        <Dropdown
            options={options}
            {...otherProps}
        />
    );
}

export default EnumerationDropdown;
