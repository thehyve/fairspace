import React from 'react';
import {Assignment, Code} from "@material-ui/icons";
import {BreadcrumbsContext} from "../common";
import LinkedDataVocabularyProvider from './vocabulary/LinkedDataVocabularyProvider';
import LinkedDataMetadataProvider from './LinkedDataMetadataProvider';

export const MetadataWrapper = ({children}) => (
    <BreadcrumbsContext.Provider value={{segments: [{label: 'Metadata', href: '/metadata', icon: <Assignment />}]}}>
        <LinkedDataMetadataProvider>
            {children}
        </LinkedDataMetadataProvider>
    </BreadcrumbsContext.Provider>
);

export const VocabularyWrapper = ({children}) => (
    <BreadcrumbsContext.Provider value={{segments: [{label: 'Vocabulary', href: '/vocabulary', icon: <Code />}]}}>
        <LinkedDataVocabularyProvider>
            {children}
        </LinkedDataVocabularyProvider>
    </BreadcrumbsContext.Provider>
);
