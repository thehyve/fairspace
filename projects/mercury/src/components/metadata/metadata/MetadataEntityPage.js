import React from 'react';

import LinkedDataPage from '../common/LinkedDataPage';
import {LinkedDataEntityFormContainer, LinkedDataEntityHeader} from '../common';
import MetadataBreadcrumbsContextProvider from "./MetadataBreadcrumbsContextProvider";

export default ({subject}) => (
    <MetadataBreadcrumbsContextProvider>
        <LinkedDataPage>
            <LinkedDataEntityHeader subject={subject} />
            <LinkedDataEntityFormContainer subject={subject} />
        </LinkedDataPage>
    </MetadataBreadcrumbsContextProvider>
);
