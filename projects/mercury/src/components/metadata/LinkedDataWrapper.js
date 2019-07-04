import React from 'react';

import {METADATA_PATH, VOCABULARY_PATH} from "../../constants";
import {LinkedDataVocabularyProvider, LinkedDataMetadataProvider} from './LinkedDataContext';
import {LinkedDataValuesContext} from "./common/LinkedDataValuesContext";
import MetadataValueComponentFactory from "./metadata/MetadataValueComponentFactory";
import VocabularyValueComponentFactory from "./vocabulary/VocabularyValueComponentFactory";


const MetadataWrapper = ({children}) => (
    <LinkedDataMetadataProvider>
        <LinkedDataValuesContext.Provider value={{editorPath: METADATA_PATH, componentFactory: MetadataValueComponentFactory}}>
            {children}
        </LinkedDataValuesContext.Provider>
    </LinkedDataMetadataProvider>
);

const VocabularyWrapper = ({children}) => (
    <LinkedDataVocabularyProvider>
        <LinkedDataValuesContext.Provider value={{editorPath: VOCABULARY_PATH, componentFactory: VocabularyValueComponentFactory}}>
            {children}
        </LinkedDataValuesContext.Provider>
    </LinkedDataVocabularyProvider>
);


const LinkedDataWrapper = ({children, location: {pathname}}) => {
    const Provider = pathname.startsWith('/vocabulary') ? VocabularyWrapper : MetadataWrapper;

    return (
        <Provider>
            {children}
        </Provider>
    );
};

export default LinkedDataWrapper;
