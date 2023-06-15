// @ts-nocheck
// @ts-nocheck
import React, { useEffect, useState } from "react";
import TextField from "@mui/material/TextField";

const BaseInputValue = ({
  entry: {
    value
  },
  property,
  currentValues,
  style,
  onChange = null,
  ...otherProps
}) => {
  const [localValue, setLocalValue] = useState(value);
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleChange = e => {
    setLocalValue(e.target.value);

    if (onChange) {
      onChange({
        value: e.target.value
      });
    }
  };

  return <TextField {...otherProps} helperText={property.description} margin="dense" multiline={property.multiLine} value={localValue} onChange={handleChange} style={{ ...style,
    marginTop: 0,
    width: '100%'
  }} />;
};

BaseInputValue.defaultProps = {
  entry: {
    value: ''
  }
};
export default BaseInputValue;