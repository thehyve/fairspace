import ReferringValue from "../common/values/ReferringValue";
import MetadataDropdownWithAdditionContainer from "./MetadataDropdownWithAdditionContainer";
import {getInputComponent} from "../common/values/LinkedDataValueComponentFactory";

export default {
    editComponent: property => getInputComponent(property) || ReferringValue,
    addComponent: property => getInputComponent(property) || MetadataDropdownWithAdditionContainer,
    readOnlyComponent: () => ReferringValue
};
