import React from 'react';
import BaseInputValue from "./BaseInputValue";

function IntegerValue(props) {
    return (
        <BaseInputValue
            {...props}
            type="number"
        />
    );
}

export default IntegerValue;
