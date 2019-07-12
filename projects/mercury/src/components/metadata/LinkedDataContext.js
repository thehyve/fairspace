import React from 'react';

import {partitionErrors} from "../../utils/linkeddata/metadataUtils";
import {ErrorDialog} from "../common";
import ValidationErrorsDisplay from './common/ValidationErrorsDisplay';
import StringValue from "./common/values/StringValue";

const LinkedDataContext = React.createContext({
    valueComponentFactory: {
        addComponent: () => StringValue,
        editComponent: () => StringValue,
        readOnlyComponent: () => StringValue
    }
});

export const onEntityCreationError = (e, id) => {
    if (e.details) {
        ErrorDialog.renderError(ValidationErrorsDisplay, partitionErrors(e.details, id), e.message);
    } else {
        ErrorDialog.showError(e, `Error creating a new entity.\n${e.message}`);
    }
};

export default LinkedDataContext;
