import React from 'react';
import BaseInputValue from "./BaseInputValue";

function DateValue(props) {
    return <BaseInputValue {...props} type="date" />;
}

export default DateValue;
