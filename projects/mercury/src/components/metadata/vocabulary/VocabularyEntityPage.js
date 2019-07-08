import React from 'react';

import LinkedDataPage from '../common/LinkedDataPage';
import VocabularyEntityHeaderContainer from './VocabularyEntityHeaderContainer';
import LinkedDataEntityFormContainer from '../common/LinkedDataEntityFormContainer';
import VocabularyBreadcrumbsContextProvider from "./VocabularyBreadcrumbsContextProvider";

export default ({subject}) => {
    return (
        <VocabularyBreadcrumbsContextProvider>
            <LinkedDataPage>
                <VocabularyEntityHeaderContainer subject={subject} />
                <LinkedDataEntityFormContainer subject={subject} />
            </LinkedDataPage>
        </VocabularyBreadcrumbsContextProvider>
    );
};
