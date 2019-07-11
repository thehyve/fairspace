import React from 'react';

import LinkedDataPage from '../common/LinkedDataPage';
import {LinkedDataEntityFormContainer, LinkedDataEntityHeader} from '../common';

export default ({subject}) => (
    <LinkedDataPage>
        <LinkedDataEntityHeader subject={subject} />
        <LinkedDataEntityFormContainer subject={subject} />
    </LinkedDataPage>
);
