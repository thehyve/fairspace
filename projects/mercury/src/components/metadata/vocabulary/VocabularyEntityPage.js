import React from 'react';

import LinkedDataPage from '../common/LinkedDataPage';
import VocabularyEntityHeaderContainer from './VocabularyEntityHeaderContainer';
import VocabularyEntityContainer from './VocabularyEntityContainer';
import VocabularyBreadcrumbsContextProvider from "./VocabularyBreadcrumbsContextProvider";

export default ({subject}) => {
    return (
        <VocabularyBreadcrumbsContextProvider>
            <LinkedDataPage>
                <VocabularyEntityHeaderContainer subject={subject} />
                <VocabularyEntityContainer subject={subject} />
            </LinkedDataPage>
        </VocabularyBreadcrumbsContextProvider>
    );
};
