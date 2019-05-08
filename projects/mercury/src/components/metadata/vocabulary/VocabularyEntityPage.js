import React from 'react';

import LinkedDataPage from '../common/LinkedDataPage';
import VocabularyEntityHeaderContainer from './VocabularyEntityHeaderContainer';
import VocabularyEntityContainer from './VocabularyEntityContainer';
import {url2iri} from "../../../utils/linkeddata/metadataUtils";

export default () => {
    const subject = url2iri(window.location.href);
    return (
        <LinkedDataPage homeUrl="/vocabulary">
            <VocabularyEntityHeaderContainer subject={subject} />
            <VocabularyEntityContainer subject={subject} />
        </LinkedDataPage>
    );
};
