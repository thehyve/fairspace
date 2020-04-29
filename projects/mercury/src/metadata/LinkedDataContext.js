import React from 'react';
import {SearchAPI, SORT_DATE_CREATED} from '../common';

import StringValue from "./common/values/StringValue";
import {handleSearchError} from "../search/searchUtils";

const LinkedDataContext = React.createContext({
    valueComponentFactory: {
        addComponent: () => StringValue,
        editComponent: () => StringValue,
        readOnlyComponent: () => StringValue,
    }
});

export const searchLinkedData = ({query, types, size, page}) => SearchAPI
    .searchLinkedData({types, query, size, page, sort: SORT_DATE_CREATED})
    .catch(handleSearchError);

export default LinkedDataContext;
