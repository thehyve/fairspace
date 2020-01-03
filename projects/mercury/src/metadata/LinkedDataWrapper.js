import React from 'react';
import {BreadcrumbsContext} from "../common";
import LinkedDataVocabularyProvider from './LinkedDataVocabularyProvider';
import LinkedDataMetadataProvider from './LinkedDataMetadataProvider';
import {projectPrefix} from "../projects/projects";

export const MetadataWrapper = ({children}) => (
    <BreadcrumbsContext.Provider value={{segments: [{label: 'Metadata', href: `${projectPrefix()}/metadata`, icon: 'assignment'}]}}>
        <LinkedDataMetadataProvider>
            {children}
        </LinkedDataMetadataProvider>
    </BreadcrumbsContext.Provider>
);

export const VocabularyWrapper = ({children}) => (
    <BreadcrumbsContext.Provider value={{segments: [{label: 'Vocabulary', href: `${projectPrefix()}/vocabulary`, icon: 'code'}]}}>
        <LinkedDataVocabularyProvider>
            {children}
        </LinkedDataVocabularyProvider>
    </BreadcrumbsContext.Provider>
);
