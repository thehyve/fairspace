import React from 'react';

import LinkedDataPage from '../common/LinkedDataPage';
import VocabularyEntityHeaderContainer from './VocabularyEntityHeaderContainer';
import VocabularyEntityContainer from './VocabularyEntityContainer';

const vocabularyEntityPage = () => (
    <LinkedDataPage homeUrl="/vocabulary">
        <VocabularyEntityHeaderContainer />
        <VocabularyEntityContainer />
    </LinkedDataPage>
);

export default vocabularyEntityPage;
