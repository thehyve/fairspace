import React from 'react';

import Dropdown from './Dropdown';
import {getLabel, valuesContainsValueOrId} from '../metadataUtils';

function EnumerationDropdown({property, currentValues, ...otherProps}) {
    const options = property.allowedValues.map((entity) => {
        const id = entity['@id'];
        const value = entity['@value'];
        const label = getLabel(entity) || value;
        const disabled = valuesContainsValueOrId(currentValues, value, id);

        return {
            disabled,
            label,
            id,
            value
        };
    });

    return (
        <Dropdown
            clearTextOnSelection
            options={options}
            isOptionDisabled={({disabled}) => disabled}
            {...otherProps}
        />
    );
}

export default EnumerationDropdown;
