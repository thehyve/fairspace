import React from "react";
import {connect} from 'react-redux';

import {withRouter} from 'react-router-dom';
import {createMetadataIri, linkLabel, partitionErrors, relativeLink} from "../../../utils/linkeddata/metadataUtils";
import {createMetadataEntityFromState} from "../../../actions/metadataActions";
import {searchMetadata} from "../../../actions/searchActions";
import {getMetadataSearchResults} from "../../../reducers/searchReducers";
import LinkedDataCreator from "../common/LinkedDataCreator";
import MetadataValueComponentFactory from "./MetadataValueComponentFactory";
import {getFirstPredicateId} from "../../../utils/linkeddata/jsonLdUtils";
import {ErrorDialog, MessageDisplay} from "../../common";
import ValidationErrorsDisplay from '../common/ValidationErrorsDisplay';
import MetadataList from "./MetadataList";
import {LinkedDataValuesContext} from "../common/LinkedDataValuesContext";
import {SHACL_TARGET_CLASS} from "../../../constants";

const MetadataBrowserContainer = ({entities, hasHighlights, ...otherProps}) => (
    <LinkedDataValuesContext.Provider value={MetadataValueComponentFactory}>
        <LinkedDataCreator {...otherProps}>
            {
                entities && entities.length > 0
                    ? <MetadataList items={entities} hasHighlights={hasHighlights} />
                    : <MessageDisplay message="The vocabulary is empty" isError={false} />
            }
        </LinkedDataCreator>
    </LinkedDataValuesContext.Provider>
);

const mapStateToProps = (state, {vocabulary}) => {
    const {items, pending, error} = getMetadataSearchResults(state);
    const entities = items.map(({id, type, label, name, highlights}) => ({
        id,
        label: (label && label[0]) || (name && name[0]) || linkLabel(id, true),
        type: type[0],
        shape: vocabulary.determineShapeForType(type[0]),
        highlights
    }));
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
        hasHighlights: entities.some(({highlights}) => highlights.length > 0),
        shapes: vocabulary.getClassesInCatalog(),
        vocabulary,
        onEntityCreationError
    };
};

const mapDispatchToProps = (dispatch, ownProps) => ({
    fetchLinkedData: () => dispatch(searchMetadata('*', ownProps.targetClasses)),
    fetchShapes: () => {},
    create: (formKey, shape, id) => {
        const subject = createMetadataIri(id);
        const type = getFirstPredicateId(shape, SHACL_TARGET_CLASS);
        return dispatch(createMetadataEntityFromState(formKey, subject, type))
            .then(() => ownProps.history.push(relativeLink(subject)));
    }
});

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(MetadataBrowserContainer));
