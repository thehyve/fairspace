import React from 'react';
import BaseInputValue from "./BaseInputValue";

function IntegerValue(props) {
    return (
        <BaseInputValue
            {...props}
            type="number"
            transformValue={v => parseInt(v, 10)}
        />
    );
}

export default IntegerValue;
