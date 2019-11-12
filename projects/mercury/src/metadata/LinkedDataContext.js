import React from 'react';
import {SearchAPI, SORT_DATE_CREATED, handleSearchError} from '@fairspace/shared-frontend';

import StringValue from "./common/values/StringValue";
import {ES_INDEX} from '../constants';
import Config from '../common/services/Config';

const LinkedDataContext = React.createContext({
    valueComponentFactory: {
        addComponent: () => StringValue,
        editComponent: () => StringValue,
        readOnlyComponent: () => StringValue,
    }
});

export const searchLinkedData = ({query, types, size, page}) => SearchAPI(Config.get(), ES_INDEX)
    .searchLinkedData({types, query, size, page, sort: SORT_DATE_CREATED})
    .catch(handleSearchError);

export default LinkedDataContext;
