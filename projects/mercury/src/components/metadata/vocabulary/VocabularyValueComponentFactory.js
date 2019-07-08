import React from "react";
import ReferringValue from "../common/values/ReferringValue";
import VocabularyDropdownWithAdditionContainer from "./VocabularyDropdownWithAdditionContainer";
import {getInputComponent} from "../common/values/LinkedDataValueComponentFactory";
import {VOCABULARY_PATH} from "../../../constants";
import LinkedDataDropdown from "../common/LinkedDataDropdown";

const defaultAddComponent = property => (property.allowAdditionOfEntities ? VocabularyDropdownWithAdditionContainer : LinkedDataDropdown);
const referringValue = props => <ReferringValue {...props} editorPath={VOCABULARY_PATH} />;

export default {
    editComponent: property => getInputComponent(property) || referringValue,
    addComponent: property => getInputComponent(property) || defaultAddComponent(property),
    readOnlyComponent: () => referringValue
};
