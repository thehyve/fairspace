import React from 'react';

import {METADATA_PATH, VOCABULARY_PATH} from "../../constants";
import {LinkedDataVocabularyProviderContainer, LinkedDataMetadataProviderContainer} from './LinkedDataContext';
import {LinkedDataValuesContext} from "./common/LinkedDataValuesContext";
import MetadataValueComponentFactory from "./metadata/MetadataValueComponentFactory";
import VocabularyValueComponentFactory from "./vocabulary/VocabularyValueComponentFactory";


export const MetadataWrapper = ({children}) => (
    <LinkedDataMetadataProviderContainer>
        <LinkedDataValuesContext.Provider value={{editorPath: METADATA_PATH, componentFactory: MetadataValueComponentFactory}}>
            {children}
        </LinkedDataValuesContext.Provider>
    </LinkedDataMetadataProviderContainer>
);

export const VocabularyWrapper = ({children}) => (
    <LinkedDataVocabularyProviderContainer>
        <LinkedDataValuesContext.Provider value={{editorPath: VOCABULARY_PATH, componentFactory: VocabularyValueComponentFactory}}>
            {children}
        </LinkedDataValuesContext.Provider>
    </LinkedDataVocabularyProviderContainer>
);
