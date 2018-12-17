import ReferringValue from "./ReferringValue";
import StringValue from "./StringValue";
import LookupEntity from "./LookupEntity";
import {
    BOOLEAN_URI,
    DATE_URI,
    DATETIME_URI,
    DECIMAL_URI,
    INTEGER_URI,
    RESOURCE_URI,
    STRING_URI,
    TIME_URI
} from "../../../services/MetadataAPI/MetadataAPI";
import IntegerValue from "./IntegerValue";
import DateTimeValue from "./DateTimeValue";
import DecimalValue from "./DecimalValue";
import DateValue from "./DateValue";
import TimeValue from "./TimeValue";
import SwitchValue from "./SwitchValue";
import ResourceValue from "./ResourceValue";

const getInputComponent = property => {
    switch (property.range) {
        case STRING_URI:
            return StringValue;
        case INTEGER_URI:
            return IntegerValue;
        case DECIMAL_URI:
            return DecimalValue;
        case DATETIME_URI:
            return DateTimeValue;
        case DATE_URI:
            return DateValue;
        case TIME_URI:
            return TimeValue;
        case BOOLEAN_URI:
            return SwitchValue;
        case RESOURCE_URI:
            return ResourceValue;
        default:
            return undefined;
    }
}

export default {
    editComponent: (property) => getInputComponent(property) || ReferringValue,
    addComponent: (property) => getInputComponent(property) || LookupEntity,
    readOnlyComponent: () => ReferringValue
}
