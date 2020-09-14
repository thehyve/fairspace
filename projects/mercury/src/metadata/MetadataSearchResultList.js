import React, {useContext} from "react";

import LinkedDataContext from "./LinkedDataContext";
import {getLabel} from "./common/metadataUtils";
import LinkedDataList from "./common/LinkedDataList";
import {typeShapeWithProperties} from "./common/vocabularyUtils";
import {renderSearchResultProperty} from '../search/searchUtils';

export default ({items, ...otherProps}) => {
    const {shapes} = useContext(LinkedDataContext);

    const entities = items.map((item) => {
        const {id, type, highlights} = item;
        const shape = typeShapeWithProperties(shapes, type);
        const typeLabel = getLabel(shape, true);

        return {
            id,
            primaryText: renderSearchResultProperty(item, 'label'),
            secondaryText: renderSearchResultProperty(item, 'comment'),
            typeLabel,
            shape,
            highlights
        };
    });

    return <LinkedDataList entities={entities} {...otherProps} />;
};
