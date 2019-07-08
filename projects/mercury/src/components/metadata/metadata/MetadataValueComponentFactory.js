import React from 'react';
import ReferringValue from "../common/values/ReferringValue";
import MetadataDropdownWithAdditionContainer from "./MetadataDropdownWithAdditionContainer";
import {getInputComponent} from "../common/values/LinkedDataValueComponentFactory";
import {METADATA_PATH} from "../../../constants";
import LinkedDataDropdown from "../common/LinkedDataDropdown";

const defaultAddComponent = property => (property.allowAdditionOfEntities ? MetadataDropdownWithAdditionContainer : LinkedDataDropdown);
const referringValue = props => <ReferringValue {...props} editorPath={METADATA_PATH} />;

export default {
    editComponent: property => getInputComponent(property) || referringValue,
    addComponent: property => getInputComponent(property) || defaultAddComponent(property),
    readOnlyComponent: () => referringValue
};
