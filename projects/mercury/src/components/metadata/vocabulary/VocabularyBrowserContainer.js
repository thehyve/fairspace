import React from "react";
import {connect} from 'react-redux';
import {withRouter} from 'react-router-dom';

import {createVocabularyIri, getLabel, partitionErrors} from "../../../utils/linkeddata/metadataUtils";
import {createVocabularyEntityFromState} from "../../../actions/vocabularyActions";
import {searchVocabulary} from "../../../actions/searchActions";
import Config from "../../../services/Config/Config";
import LinkedDataCreator from "../common/LinkedDataCreator";
import VocabularyValueComponentFactory from "./VocabularyValueComponentFactory";
import {isDataSteward} from "../../../utils/userUtils";
import {getAuthorizations} from "../../../reducers/account/authorizationsReducers";
import {getFirstPredicateId} from "../../../utils/linkeddata/jsonLdUtils";
import {ErrorDialog, MessageDisplay} from "../../common";
import ValidationErrorsDisplay from '../common/ValidationErrorsDisplay';
import {getVocabularySearchResults} from "../../../reducers/searchReducers";
import {LinkedDataValuesContext} from "../common/LinkedDataValuesContext";
import {SHACL_TARGET_CLASS, VOCABULARY_PATH} from "../../../constants";
import LinkedDataList from "../common/LinkedDataList";

const openVocabulary= (history, id) => {
    history.push(`${VOCABULARY_PATH}?iri=` + encodeURIComponent(id));
};

const VocabularyBrowserContainer = (
    {entities, hasHighlights, footerRender, total, history, ...otherProps}
) => {
    return (
        <LinkedDataValuesContext.Provider value={VocabularyValueComponentFactory}>
            <LinkedDataCreator requireIdentifier={false} {...otherProps}>
                {
                    entities && entities.length > 0
                        ? (
                            <LinkedDataList
                                items={entities}
                                total={total}
                                hasHighlights={hasHighlights}
                                footerRender={footerRender}
                                typeRender={entry => <a href={entry.typeUrl}> {entry.typeLabel} </a>}
                                onOpen={id => openVocabulary(history, id)}
                            />
                        )
                        : <MessageDisplay message="The vocabulary is empty" isError={false} />
                }
            </LinkedDataCreator>
        </LinkedDataValuesContext.Provider>
    );
};

const mapStateToProps = (state, {metaVocabulary}) => {
    const {items, pending, error, total} = getVocabularySearchResults(state);
    const entities = items.map((
        {id, name, description, type, highlights}
    ) => {
        const shape = metaVocabulary.determineShapeForTypes(type) || {};
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
    const onEntityCreationError = (e, id) => {
        if (e.details) {
            ErrorDialog.renderError(ValidationErrorsDisplay, partitionErrors(e.details, createVocabularyIri(id)), e.message);
        } else {
            ErrorDialog.showError(e, `Error creating a new vocabulary.\n${e.message}`);
        }
    };

    return {
        isEditable: isDataSteward(getAuthorizations(state), Config.get()),
        shapes: metaVocabulary.getClassesInCatalog(),
        loading: pending,
        error,
        entities,
        total,
        hasHighlights: entities.some(({highlights}) => highlights.length > 0),
        vocabulary: metaVocabulary,
        onEntityCreationError
    };
};

const mapDispatchToProps = (dispatch, ownProps) => ({
    fetchLinkedData: () => dispatch(searchVocabulary({query: '*', types: ownProps.targetClasses})),
    fetchShapes: () => {},
    create: (formKey, shape, id) => {
        const subject = id && createVocabularyIri(id);
        const type = getFirstPredicateId(shape, SHACL_TARGET_CLASS);

        return dispatch(createVocabularyEntityFromState(formKey, subject, type))
            .then(({value}) => openVocabulary(ownProps.history, value.subject));
    }
});

// Please note that withRoute must be applied after connect
// in order to have the history available in mapDispatchToProps
export default withRouter(connect(mapStateToProps, mapDispatchToProps)(VocabularyBrowserContainer));
