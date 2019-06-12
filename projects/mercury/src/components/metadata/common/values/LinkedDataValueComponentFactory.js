import StringValue from "./StringValue";
import * as constants from "../../../../constants";
import NumberValue from "./NumberValue";
import DateTimeValue from "./DateTimeValue";
import DateValue from "./DateValue";
import TimeValue from "./TimeValue";
import SwitchValue from "./SwitchValue";
import ResourceValueContainer from "./ResourceValueContainer";
import EnumerationDropdown from "./EnumerationDropdown";

export const getInputComponent = (property) => {
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

    // If this class refers to a generic IRI, let the user
    // enter the iri in a textbox
    if (property.isGenericIriResource) {
        return ResourceValueContainer;
    }

    // The datatype determines the type of input element
    // If no datatype is specified, the field will be treated
    // as referring to another class
    switch (property.datatype) {
        case constants.STRING_URI:
            return StringValue;
        case constants.INTEGER_URI:
        case constants.DECIMAL_URI:
        case constants.LONG_URI:
            return NumberValue;
        case constants.DATETIME_URI:
            return DateTimeValue;
        case constants.DATE_URI:
            return DateValue;
        case constants.TIME_URI:
            return TimeValue;
        case constants.BOOLEAN_URI:
            return SwitchValue;
        default:
            return undefined;
    }
};
