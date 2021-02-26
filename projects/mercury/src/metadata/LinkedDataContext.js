import React from 'react';

import StringValue from "./common/values/StringValue";
import {handleSearchError} from "../search/searchUtils";
import SearchAPI, {SORT_SCORE} from "../search/ESSearchAPI";

const LinkedDataContext = React.createContext({
    valueComponentFactory: {
        addComponent: () => StringValue,
        editComponent: () => StringValue,
        readOnlyComponent: () => StringValue,
    }
});

export const searchLinkedData = ({query, types, size, page}) => SearchAPI
    .searchLinkedData({types, query, size, page, sort: SORT_SCORE})
    .catch(handleSearchError);

export default LinkedDataContext;
