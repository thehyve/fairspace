import React, {useContext} from "react";

import LinkedDataContext from "./LinkedDataContext";
import {getLabel} from "./common/metadataUtils";
import LinkedDataList from "./common/LinkedDataList";
import {getFirstPredicateId} from "./common/jsonLdUtils";
import {SHACL_TARGET_CLASS, VOCABULARY_PATH} from "../constants";
import {determineShapeForTypes} from "./common/vocabularyUtils";
import LinkedDataLink from "./common/LinkedDataLink";

export default ({items, ...otherProps}) => {
    const {shapes} = useContext(LinkedDataContext);

    const entities = items.map(({id, name, description, type, highlights}) => {
        const shape = determineShapeForTypes(shapes, type) || {};
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

    const typeRender = (entry) => <LinkedDataLink editorPath={VOCABULARY_PATH} uri={entry.typeUrl}>{entry.typeLabel}</LinkedDataLink>;

    return <LinkedDataList entities={entities} typeRender={typeRender} {...otherProps} />;
};
