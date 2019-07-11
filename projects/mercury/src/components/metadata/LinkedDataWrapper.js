import React from 'react';

import {METADATA_PATH, VOCABULARY_PATH} from "../../constants";
import LinkedDataVocabularyProvider from './LinkedDataVocabularyProvider';
import LinkedDataMetadataProvider from './LinkedDataMetadataProvider';
import {LinkedDataValuesContext} from "./common/LinkedDataValuesContext";
import MetadataValueComponentFactory from "./metadata/MetadataValueComponentFactory";
import VocabularyValueComponentFactory from "./vocabulary/VocabularyValueComponentFactory";
import BreadcrumbsContext from '../common/breadcrumbs/BreadcrumbsContext';

export const MetadataWrapper = ({children}) => (
    <BreadcrumbsContext.Provider value={{segments: [{label: 'Metadata', href: '/metadata', icon: 'assignment'}]}}>
        <LinkedDataMetadataProvider>
            <LinkedDataValuesContext.Provider value={{editorPath: METADATA_PATH, componentFactory: MetadataValueComponentFactory}}>
                {children}
            </LinkedDataValuesContext.Provider>
        </LinkedDataMetadataProvider>
    </BreadcrumbsContext.Provider>
);

export const VocabularyWrapper = ({children}) => (
    <BreadcrumbsContext.Provider value={{segments: [{label: 'Vocabulary', href: '/vocabulary', icon: 'code'}]}}>
        <LinkedDataVocabularyProvider>
            <LinkedDataValuesContext.Provider value={{editorPath: VOCABULARY_PATH, componentFactory: VocabularyValueComponentFactory}}>
                {children}
            </LinkedDataValuesContext.Provider>
        </LinkedDataVocabularyProvider>
    </BreadcrumbsContext.Provider>
);
