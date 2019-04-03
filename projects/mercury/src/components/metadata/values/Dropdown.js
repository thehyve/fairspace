import React from 'react';
import PropTypes from 'prop-types';
import MaterialReactSelect from "../../common/MaterialReactSelect";
import {getLabel} from "../../../utils/metadataUtils";
import {compareBy} from "../../../utils/comparisionUtils";

function Dropdown({
    entities, property, onSave, ...otherProps
}) {
    // Transform the entities to ensure a label is present
    const options = entities.map((entity) => {
        const id = entity['@id'];
        const label = getLabel(entity);
        const value = entity['@value'];

        const option = {
            disabled: property.values.some(v => (v.id && v.id === id) || (v.value && v.value === value)),
            label: label || value,
            id,
            value
        };

        return option;
    });

    options.sort(compareBy('disabled'));

    // Prevent saving any labels used for UI
    const handleSave = (selected) => {
        onSave({id: selected.id, label: selected.label, value: selected.value});
    };

    return (
        <MaterialReactSelect
            style={{width: '100%'}}
            {...otherProps}
            options={options}
            onChange={handleSave}
        />
    );
}

Dropdown.propTypes = {
    property: PropTypes.object.isRequired,
    entry: PropTypes.object,
    onSave: PropTypes.func,
    entities: PropTypes.array
};

export default (Dropdown);
