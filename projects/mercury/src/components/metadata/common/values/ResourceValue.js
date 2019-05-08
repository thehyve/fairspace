import React from 'react';

import BaseInputValue from "./BaseInputValue";

function ResourceValue(props) {
    const entry = {...props.entry, value: props.entry.id || ''};
    const onChange = ({value}) => props.onChange({id: value});
    return (
        <BaseInputValue
            {...props}
            entry={entry}
            onChange={onChange}
            type="url"
        />
    );
}

ResourceValue.defaultProps = {
    entry: {}
};

export default ResourceValue;
