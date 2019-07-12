import React from 'react';
import {LinkedDataMetadataProviderContainer, LinkedDataVocabularyProviderContainer} from './LinkedDataContext';
import LinkedDataVocabularyProvider from './LinkedDataVocabularyProvider';
import LinkedDataMetadataProvider from './LinkedDataMetadataProvider';
import BreadcrumbsContext from '../common/breadcrumbs/BreadcrumbsContext';

export const MetadataWrapper = ({children}) => (
    <BreadcrumbsContext.Provider value={{segments: [{label: 'Metadata', href: '/metadata', icon: 'assignment'}]}}>
        <LinkedDataMetadataProvider>
            {children}
        </LinkedDataMetadataProvider>
    </BreadcrumbsContext.Provider>
);

export const VocabularyWrapper = ({children}) => (
    <BreadcrumbsContext.Provider value={{segments: [{label: 'Vocabulary', href: '/vocabulary', icon: 'code'}]}}>
        <LinkedDataVocabularyProvider>
            {children}
        </LinkedDataVocabularyProvider>
    </BreadcrumbsContext.Provider>
);
