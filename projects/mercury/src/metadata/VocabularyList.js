import React, {useContext} from "react";

import LinkedDataContext from "./LinkedDataContext";
import {getLabel} from "../common/utils/linkeddata/metadataUtils";
import LinkedDataList from "./common/LinkedDataList";
import {getFirstPredicateId} from "../common/utils/linkeddata/jsonLdUtils";
import {SHACL_TARGET_CLASS} from "../constants";

export default ({items, ...otherProps}) => {
    const {determineShapeForTypes} = useContext(LinkedDataContext);

    const entities = items.map(({id, name, description, type, highlights}) => {
        const shape = determineShapeForTypes(type) || {};
        const typeLabel = getLabel(shape, true);
        const typeUrl = getFirstPredicateId(shape, SHACL_TARGET_CLASS);

        return {
            id,
            primaryText: name,
            secondaryText: description,
            typeLabel,
            typeUrl,
            highlights
        };
    });

    const typeRender = (entry) => <a href={entry.typeUrl}> {entry.typeLabel} </a>;

    return <LinkedDataList entities={entities} typeRender={typeRender} {...otherProps} />;
};
