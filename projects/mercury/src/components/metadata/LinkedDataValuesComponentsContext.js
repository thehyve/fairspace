import React from 'react';

import * as constants from "../../constants";
import ReferringValue from "./common/values/ReferringValue";
import StringValue from "./common/values/StringValue";
import NumberValue from "./common/values/NumberValue";
import DateTimeValue from "./common/values/DateTimeValue";
import DateValue from "./common/values/DateValue";
import TimeValue from "./common/values/TimeValue";
import SwitchValue from "./common/values/SwitchValue";
import ResourceValue from "./common/values/ResourceValue";
import EnumerationDropdown from "./common/values/EnumerationDropdown";
// import MetadataDropdownWithAdditionContainer from "./metadata/MetadataDropdownWithAdditionContainer";
// import MetadataDropdownContainer from "./metadata/MetadataDropdownContainer";

const LinkedDataValuesComponentsContext = React.createContext();

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

    // If this class refers to a generic IRI, let the user
    // enter the iri in a textbox
    if (property.isGenericIriResource) {
        return ResourceValue;
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

const getDefaultAddComponent = (property, dropdownComponent, dropdownWithAdditionComponent) => {
    // const isMetadataPath = editorPath === constants.METADATA_PATH;
    return property.allowAdditionOfEntities ? dropdownWithAdditionComponent : dropdownComponent;
};

export const LinkedDataValuesComponentsProvider = ({children, editorPath, dropdownComponent, dropdownWithAdditionComponent}) => {
    if (editorPath !== constants.VOCABULARY_PATH && editorPath !== constants.METADATA_PATH) {
        throw new Error('The editor path in unknown');
    }

    const referringValue = props => <ReferringValue {...props} editorPath={editorPath} />;
    const addComponent = (property) => getInputComponent(property) || referringValue;
    const editComponent = (property) => getInputComponent(property) || getDefaultAddComponent(property, dropdownComponent, dropdownWithAdditionComponent);
    const readOnlyComponent = () => referringValue;

    return (
        <LinkedDataValuesComponentsContext.Provider
            value={{
                editorPath,
                addComponent,
                editComponent,
                readOnlyComponent,
            }}
        >
            {children}
        </LinkedDataValuesComponentsContext.Provider>
    );
};

export default LinkedDataValuesComponentsContext;
