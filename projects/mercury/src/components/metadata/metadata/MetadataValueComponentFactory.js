import React from 'react';
import ReferringValue from "../common/values/ReferringValue";
import MetadataDropdownWithAdditionContainer from "./MetadataDropdownWithAdditionContainer";
import {getInputComponent} from "../common/values/LinkedDataValueComponentFactory";
import MetadataDropdownContainer from "./MetadataDropdownContainer";
import {METADATA_EDITOR_PATH} from "../../../constants";

const defaultAddComponent = property => (property.allowAdditionOfEntities ? MetadataDropdownWithAdditionContainer : MetadataDropdownContainer);
const referringValue = props => <ReferringValue {...props} editorPath={METADATA_EDITOR_PATH} />;

export default {
    editComponent: property => getInputComponent(property) || referringValue,
    addComponent: property => getInputComponent(property) || defaultAddComponent(property),
    readOnlyComponent: () => referringValue
};
