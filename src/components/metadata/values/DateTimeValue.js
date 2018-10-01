import React from 'react'
import BaseInputValue from "./BaseInputValue";

function DateTimeValue(props) {
    return <BaseInputValue {...props} type={"datetime-local"} />
}

export default DateTimeValue;
