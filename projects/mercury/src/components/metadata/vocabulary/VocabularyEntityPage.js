import React from 'react';

import LinkedDataPage from '../common/LinkedDataPage';
import {LinkedDataEntityFormContainer, LinkedDataEntityHeader} from '../common';
import VocabularyBreadcrumbsContextProvider from "./VocabularyBreadcrumbsContextProvider";

export default ({subject}) => (
    <VocabularyBreadcrumbsContextProvider>
        <LinkedDataPage>
            <LinkedDataEntityHeader subject={subject} />
            <LinkedDataEntityFormContainer subject={subject} />
        </LinkedDataPage>
    </VocabularyBreadcrumbsContextProvider>
);
