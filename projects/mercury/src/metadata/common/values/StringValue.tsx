// @ts-nocheck
// @ts-nocheck
import React from "react";
import BaseInputValue from "./BaseInputValue";

function StringValue(props) {
  return <BaseInputValue {...props} type="text" />;
}

StringValue.defaultProps = {
  entry: {
    value: ''
  }
};
export default StringValue;