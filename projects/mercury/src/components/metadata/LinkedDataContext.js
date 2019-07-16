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



export default LinkedDataContext;
