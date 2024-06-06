import React from 'react';

import StringValue from './common/values/StringValue';

const LinkedDataContext = React.createContext({
    valueComponentFactory: {
        addComponent: () => StringValue,
        editComponent: () => StringValue,
        readOnlyComponent: () => StringValue
    }
});

export default LinkedDataContext;
