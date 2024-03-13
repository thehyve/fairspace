import React from 'react';

import BaseInputValue from './BaseInputValue';

function ExternalLinkValue(props) {
    const entry = {...props.entry, value: props.entry.id || ''};
    const onChange = ({value}) => ((value && value.trim()) ? (props.onChange({id: value})) : {});
    return (
        <BaseInputValue
            {...props}
            entry={entry}
            onChange={onChange}
            type="url"
        />
    );
}

ExternalLinkValue.defaultProps = {
    entry: {}
};

export default ExternalLinkValue;
