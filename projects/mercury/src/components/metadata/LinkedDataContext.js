import React from 'react';

import {partitionErrors} from "../../utils/linkeddata/metadataUtils";
import {ErrorDialog} from "../common";
import ValidationErrorsDisplay from './common/ValidationErrorsDisplay';

const LinkedDataContext = React.createContext({});

export const onEntityCreationError = (e, id) => {
    if (e.details) {
        ErrorDialog.renderError(ValidationErrorsDisplay, partitionErrors(e.details, id), e.message);
    } else {
        ErrorDialog.showError(e, `Error creating a new entity.\n${e.message}`);
    }
};

export default LinkedDataContext;
