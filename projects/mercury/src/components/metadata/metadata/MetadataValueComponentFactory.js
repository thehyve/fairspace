import ReferringValue from "../common/values/ReferringValue";
import MetadataDropdownWithAdditionContainer from "./MetadataDropdownWithAdditionContainer";
import {getInputComponent} from "../common/values/LinkedDataValueComponentFactory";
import MetadataDropdownContainer from "./MetadataDropdownContainer";

const defaultAddComponent = property => (property.allowAdditionOfEntities ? MetadataDropdownWithAdditionContainer : MetadataDropdownContainer);

export default {
    editComponent: property => getInputComponent(property) || ReferringValue,
    addComponent: property => getInputComponent(property) || defaultAddComponent(property),
    readOnlyComponent: () => ReferringValue
};
