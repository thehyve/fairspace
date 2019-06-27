import React from 'react';

import LinkedDataPage from '../common/LinkedDataPage';
import MetadataEntityHeaderContainer from "./MetadataEntityHeaderContainer";
import LinkedDataEntityFormContainer from '../common/LinkedDataEntityFormContainer';

export default ({subject}) => (
    <LinkedDataPage homeUrl="/metadata">
        <MetadataEntityHeaderContainer subject={subject} />
        <LinkedDataEntityFormContainer formKey={subject} />
    </LinkedDataPage>
);
