import React from 'react';

import LinkedDataPage from './LinkedDataPage';
import {LinkedDataEntityFormContainer, LinkedDataEntityHeader} from '.';

export default ({subject}) => (
    <LinkedDataPage>
        <LinkedDataEntityHeader subject={subject} />
        <LinkedDataEntityFormContainer subject={subject} />
    </LinkedDataPage>
);
