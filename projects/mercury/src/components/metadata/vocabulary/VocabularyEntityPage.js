import React from 'react';

import BreadCrumbs from "../../common/BreadCrumbs";
import VocabularyEntityContainer from './VocabularyEntityContainer';

const vocabularyEntityPage = () => (
    <>
        <BreadCrumbs homeUrl="/vocabulary" />
        <VocabularyEntityContainer showHeader />
    </>
);

export default vocabularyEntityPage;
