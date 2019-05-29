import React from "react";
import ReferringValue from "../common/values/ReferringValue";
import VocabularyDropdownWithAdditionContainer from "./VocabularyDropdownWithAdditionContainer";
import {getInputComponent} from "../common/values/LinkedDataValueComponentFactory";
import VocabularyDropdownContainer from "./VocabularyDropdownContainer";
import {VOCABULARY_PATH} from "../../../constants";

const defaultAddComponent = property => (property.allowAdditionOfEntities ? VocabularyDropdownWithAdditionContainer : VocabularyDropdownContainer);
const referringValue = props => <ReferringValue {...props} editorPath={VOCABULARY_PATH} />;

export default {
    editComponent: property => getInputComponent(property) || referringValue,
    addComponent: property => getInputComponent(property) || defaultAddComponent(property),
    readOnlyComponent: () => referringValue
};
