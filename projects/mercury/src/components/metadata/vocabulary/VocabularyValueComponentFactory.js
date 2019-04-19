import ReferringValue from "../common/values/ReferringValue";
import VocabularyDropdownWithAdditionContainer from "./VocabularyDropdownWithAdditionContainer";
import {getInputComponent} from "../common/values/LinkedDataValueComponentFactory";

export default {
    editComponent: property => getInputComponent(property) || ReferringValue,
    addComponent: property => getInputComponent(property) || VocabularyDropdownWithAdditionContainer,
    readOnlyComponent: () => ReferringValue
};
