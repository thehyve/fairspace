import ReferringValue from "../common/values/ReferringValue";
import VocabularyDropdownWithAdditionContainer from "./VocabularyDropdownWithAdditionContainer";
import {getInputComponent} from "../common/values/LinkedDataValueComponentFactory";
import VocabularyDropdownContainer from "./VocabularyDropdownContainer";

const defaultAddComponent = property => (property.allowAdditionOfEntities ? VocabularyDropdownWithAdditionContainer : VocabularyDropdownContainer);

export default {
    editComponent: property => getInputComponent(property) || ReferringValue,
    addComponent: property => getInputComponent(property) || defaultAddComponent(property),
    readOnlyComponent: () => ReferringValue
};
