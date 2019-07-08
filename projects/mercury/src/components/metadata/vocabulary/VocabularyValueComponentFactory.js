import React from "react";
import ReferringValue from "../common/values/ReferringValue";
import {getInputComponent} from "../common/values/LinkedDataValueComponentFactory";
import {VOCABULARY_PATH} from "../../../constants";
import LinkedDataDropdown from "../common/LinkedDataDropdown";
import LinkedDataDropdownWithAddition from "../common/LinkedDataDropdownWithAddition";

const defaultAddComponent = property => (property.allowAdditionOfEntities ? LinkedDataDropdownWithAddition : LinkedDataDropdown);
const referringValue = props => <ReferringValue {...props} editorPath={VOCABULARY_PATH} />;

export default {
    editComponent: property => getInputComponent(property) || referringValue,
    addComponent: property => getInputComponent(property) || defaultAddComponent(property),
    readOnlyComponent: () => referringValue
};
