import React from 'react';
import {Assignment, Code} from "@material-ui/icons";
import {BreadcrumbsContext} from "../common";
import LinkedDataVocabularyProvider from './LinkedDataVocabularyProvider';
import LinkedDataMetadataProvider from './LinkedDataMetadataProvider';
import {workspacePrefix} from "../workspaces/workspaces";

export const MetadataWrapper = ({children}) => (
    <BreadcrumbsContext.Provider value={{segments: [{label: 'Metadata', href: `${workspacePrefix()}/metadata`, icon: <Assignment />}]}}>
        <LinkedDataMetadataProvider>
            {children}
        </LinkedDataMetadataProvider>
    </BreadcrumbsContext.Provider>
);

export const VocabularyWrapper = ({children}) => (
    <BreadcrumbsContext.Provider value={{segments: [{label: 'Vocabulary', href: `${workspacePrefix()}/vocabulary`, icon: <Code />}]}}>
        <LinkedDataVocabularyProvider>
            {children}
        </LinkedDataVocabularyProvider>
    </BreadcrumbsContext.Provider>
);
