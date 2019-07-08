import React from "react";
import {connect} from 'react-redux';

import {withRouter} from 'react-router-dom';
import {createMetadataIri, getLabel, partitionErrors} from "../../../utils/linkeddata/metadataUtils";
import {createMetadataEntityFromState} from "../../../actions/metadataActions";
import {searchMetadata} from "../../../actions/searchActions";
import {getMetadataSearchResults} from "../../../reducers/searchReducers";
import LinkedDataCreator from "../common/LinkedDataCreator";
import {getFirstPredicateId} from "../../../utils/linkeddata/jsonLdUtils";
import {ErrorDialog, MessageDisplay} from "../../common";
import ValidationErrorsDisplay from '../common/ValidationErrorsDisplay';
import {METADATA_PATH, SHACL_TARGET_CLASS, VOCABULARY_PATH} from "../../../constants";
import LinkedDataLink from "../common/LinkedDataLink";
import LinkedDataList from "../common/LinkedDataList";
import Iri from "../../common/Iri";

const openMetadataEntry = (history, id) => {
    history.push(`${METADATA_PATH}?iri=` + encodeURIComponent(id));
};

const MetadataBrowserContainer = ({entities, hasHighlights, footerRender, total, history, ...otherProps}) => (
    <LinkedDataCreator requireIdentifier {...otherProps}>
        {
            entities && entities.length > 0
                ? (
                    <LinkedDataList
                        items={entities}
                        total={total}
                        hasHighlights={hasHighlights}
                        footerRender={footerRender}
                        typeRender={entry => <LinkedDataLink editorPath={VOCABULARY_PATH} uri={entry.shapeUrl}>{entry.typeLabel}</LinkedDataLink>}
                        onOpen={id => openMetadataEntry(history, id)}
                    />
                )
                : <MessageDisplay message="The metadata layer is empty" isError={false} />
        }
    </LinkedDataCreator>
);

const mapStateToProps = (state, {vocabulary}) => {
    const {items, pending, error, total} = getMetadataSearchResults(state);
    const entities = items.map((
        {id, label, comment, type, highlights}
    ) => {
        const shape = vocabulary.determineShapeForTypes(type);
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

    const onEntityCreationError = (e, id) => {
        if (e.details) {
            ErrorDialog.renderError(ValidationErrorsDisplay, partitionErrors(e.details, createMetadataIri(id)), e.message);
        } else {
            ErrorDialog.showError(e, `Error creating a new metadata entity.\n${e.message}`);
        }
    };

    return {
        loading: pending,
        error,
        entities,
        total,
        hasHighlights: entities.some(({highlights}) => highlights.length > 0),
        shapes: vocabulary.getClassesInCatalog(),
        onEntityCreationError
    };
};

const mapDispatchToProps = (dispatch, ownProps) => ({
    fetchLinkedData: () => dispatch(searchMetadata({query: '*', types: ownProps.targetClasses})),
    fetchShapes: () => {},
    create: (formKey, shape, subject) => {
        const type = getFirstPredicateId(shape, SHACL_TARGET_CLASS);
        return dispatch(createMetadataEntityFromState(formKey, subject, type))
            .then(() => openMetadataEntry(ownProps.history, subject));
    }
});

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(MetadataBrowserContainer));
