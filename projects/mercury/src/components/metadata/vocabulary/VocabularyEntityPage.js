import React from 'react';

import LinkedDataPage from '../common/LinkedDataPage';
import VocabularyEntityHeaderContainer from './VocabularyEntityHeaderContainer';
import LinkedDataEntityFormContainer from '../common/LinkedDataEntityFormContainer';

export default ({subject}) => (
    <LinkedDataPage homeUrl="/vocabulary">
        <VocabularyEntityHeaderContainer subject={subject} />
        <LinkedDataEntityFormContainer subject={subject} />
    </LinkedDataPage>
);
