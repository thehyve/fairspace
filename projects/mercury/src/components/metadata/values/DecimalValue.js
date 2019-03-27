import React from 'react';
import BaseInputValue from "./BaseInputValue";

const DEFAULT_STEP_SIZE = 0.1;

function DecimalValue(props) {
    return (
        <BaseInputValue
            {...props}
            type="number"
            inputProps={{step: DEFAULT_STEP_SIZE}}
        />
    );
}

export default DecimalValue;
