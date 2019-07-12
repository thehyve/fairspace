import React from 'react';
import {LinkedDataMetadataProviderContainer, LinkedDataVocabularyProviderContainer} from './LinkedDataContext';
import BreadcrumbsContext from '../common/breadcrumbs/BreadcrumbsContext';

export const MetadataWrapper = ({children}) => (
    <BreadcrumbsContext.Provider value={{segments: [{label: 'Metadata', href: '/metadata', icon: 'assignment'}]}}>
        <LinkedDataMetadataProviderContainer>
            {children}
        </LinkedDataMetadataProviderContainer>
    </BreadcrumbsContext.Provider>
);

export const VocabularyWrapper = ({children}) => (
    <BreadcrumbsContext.Provider value={{segments: [{label: 'Vocabulary', href: '/vocabulary', icon: 'code'}]}}>
        <LinkedDataVocabularyProviderContainer>
            {children}
        </LinkedDataVocabularyProviderContainer>
    </BreadcrumbsContext.Provider>
);
