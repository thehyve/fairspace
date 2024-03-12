import StringValue from './StringValue';
import * as constants from '../../../constants';
import NumberValue from './NumberValue';
import DateTimeValue from './DateTimeValue';
import DateValue from './DateValue';
import TimeValue from './TimeValue';
import SwitchValue from './SwitchValue';
import ResourceValue from './ResourceValue';
import EnumerationDropdown from './EnumerationDropdown';
import LinkedDataDropdownWithAddition from '../LinkedDataDropdownWithAddition';
import LinkedDataDropdown from '../LinkedDataDropdown';
import ReferringValue from './ReferringValue';
import ExternalLinkValue from './ExternalLinkValue';
import MarkdownValue from './MarkdownValue';

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
    // enter the iri in a textbox. There are 2 flavors:
    //   - an external link shows just a textbox (ExternalLinkValue
    //   - a normal generic iri shows a textbox with the option to select a namespace (ResourceValue)
    if (property.isGenericIriResource) {
        return property.isExternalLink ? ExternalLinkValue : ResourceValue;
    }

    // The datatype determines the type of input element
    // If no datatype is specified, the field will be treated
    // as referring to another class
    switch (property.datatype) {
        case constants.STRING_URI:
            return StringValue;
        case constants.MARKDOWN_URI:
            return MarkdownValue;
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

const defaultAddComponent = property => (property.allowAdditionOfEntities ? LinkedDataDropdownWithAddition : LinkedDataDropdown);

export default {
    editComponent: property => getInputComponent(property) || ReferringValue,
    addComponent: property => getInputComponent(property) || defaultAddComponent(property),
    readOnlyComponent: () => ReferringValue
};
