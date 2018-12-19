import React from 'react';
import BaseInputValue from "./BaseInputValue";

function TimeValue(props) {
    return <BaseInputValue {...props} type="time" />;
}

export default TimeValue;
