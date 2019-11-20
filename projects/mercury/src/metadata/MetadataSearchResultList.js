import React, {useContext} from "react";

import Iri from "../common/components/Iri";
import LinkedDataContext from "./LinkedDataContext";
import {getLabel} from "../common/utils/linkeddata/metadataUtils";
import LinkedDataList from "./common/LinkedDataList";
import LinkedDataLink from "./common/LinkedDataLink";
import {VOCABULARY_PATH} from "../constants";
import {determineShapeForTypes} from "../common/utils/linkeddata/vocabularyUtils";

export default ({items, ...otherProps}) => {
    const {shapes} = useContext(LinkedDataContext);

    const entities = items.map(({id, label, comment, type, highlights}) => {
        const shape = determineShapeForTypes(shapes, type);
        const typeLabel = getLabel(shape, true);
        const shapeUrl = shape['@id'];

        return {
            id,
            primaryText: (label && label[0]) || <Iri iri={id} />,
            secondaryText: (comment && comment[0]),
            typeLabel,
            shapeUrl,
            highlights
        };
    });

    const typeRender = (entry) => <LinkedDataLink editorPath={VOCABULARY_PATH} uri={entry.shapeUrl}>{entry.typeLabel}</LinkedDataLink>;

    return <LinkedDataList entities={entities} typeRender={typeRender} {...otherProps} />;
};
