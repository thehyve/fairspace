import React from 'react';

import LinkedDataPage from '../common/LinkedDataPage';
import VocabularyEntityHeaderContainer from './VocabularyEntityHeaderContainer';
import VocabularyEntityContainer from './VocabularyEntityContainer';

export default ({subject}) => {
    return (
        <LinkedDataPage homeUrl="/vocabulary">
            <VocabularyEntityHeaderContainer subject={subject} />
            <VocabularyEntityContainer subject={subject} />
        </LinkedDataPage>
    );
};
