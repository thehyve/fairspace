import ReferringValue from "./ReferringValue";
import StringValue from "./StringValue";
import * as constants from "../../../constants";
import IntegerValue from "./IntegerValue";
import DateTimeValue from "./DateTimeValue";
import DecimalValue from "./DecimalValue";
import DateValue from "./DateValue";
import TimeValue from "./TimeValue";
import SwitchValue from "./SwitchValue";
import ResourceValue from "./ResourceValue";
import EntityDropdownContainer from "./EntityDropdownContainer";
import EnumerationDropdown from "./EnumerationDropdown";

const getInputComponent = (property) => {
    // If the property has a restricted set of allowed values
    // show a dropdown with these values
    if (property.allowedValues) {
        return EnumerationDropdown;
    }

    // If the class refers to a RDF List, we currently
    // only support string values
    if (property.isRdfList) {
        return StringValue;
    }

    // The datatype determines the type of input element
    // If no datatype is specified, the field will be treated
    // as referring to another class
    switch (property.datatype) {
        case constants.STRING_URI:
            return StringValue;
        case constants.INTEGER_URI:
            return IntegerValue;
        case constants.DECIMAL_URI:
            return DecimalValue;
        case constants.DATETIME_URI:
            return DateTimeValue;
        case constants.DATE_URI:
            return DateValue;
        case constants.TIME_URI:
            return TimeValue;
        case constants.BOOLEAN_URI:
            return SwitchValue;
        case constants.RESOURCE_URI:
            return ResourceValue;
        default:
            return undefined;
    }
};

export default {
    editComponent: property => getInputComponent(property) || ReferringValue,
    addComponent: property => getInputComponent(property) || EntityDropdownContainer,
    readOnlyComponent: () => ReferringValue
};
