import React from "react";
import {connect} from 'react-redux';
import {withRouter} from 'react-router-dom';

import {createVocabularyIri, relativeLink, partitionErrors, getLabel} from "../../../utils/linkeddata/metadataUtils";
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
import VocabularyList from "./VocabularyList";
import {LinkedDataValuesContext} from "../common/LinkedDataValuesContext";
import {SHACL_TARGET_CLASS, VOCABULARY_PATH} from "../../../constants";

const VocabularyBrowserContainer = ({entities, hasHighlights, history, ...otherProps}) => {
    const handleVocabularOpen = (id) => {
        history.push(`${VOCABULARY_PATH}?iri=` + encodeURIComponent(id));
    };

    return (
        <LinkedDataValuesContext.Provider value={VocabularyValueComponentFactory}>
            <LinkedDataCreator {...otherProps}>
                {
                    entities && entities.length > 0
                        ? (
                            <VocabularyList
                                items={entities}
                                hasHighlights={hasHighlights}
                                onVocabularyOpen={handleVocabularOpen}
                            />
                        )
                        : <MessageDisplay message="The metadata is empty" isError={false} />
                }
            </LinkedDataCreator>
        </LinkedDataValuesContext.Provider>
    );
};

const mapStateToProps = (state, {metaVocabulary}) => {
    const {items, pending, error} = getVocabularySearchResults(state);
    const entities = items.map((
        {id, name, description, type, highlights}
    ) => {
        const shape = type[0] ? metaVocabulary.determineShapeForType(type[0]) : {};
        const typeLabel = getLabel(shape, true);
        const typeUrl = getFirstPredicateId(shape, SHACL_TARGET_CLASS);

        return {
            id,
            name,
            typeLabel,
            typeUrl,
            description,
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
        editable: isDataSteward(getAuthorizations(state), Config.get()),
        shapes: metaVocabulary.getClassesInCatalog(),
        loading: pending,
        error,
        entities,
        hasHighlights: entities.some(({highlights}) => highlights.length > 0),
        vocabulary: metaVocabulary,
        onEntityCreationError
    };
};

const mapDispatchToProps = (dispatch, ownProps) => ({
    fetchLinkedData: () => dispatch(searchVocabulary('*', ownProps.targetClasses)),
    fetchShapes: () => {},
    create: (formKey, shape, id) => {
        const subject = createVocabularyIri(id);
        const type = getFirstPredicateId(shape, SHACL_TARGET_CLASS);

        return dispatch(createVocabularyEntityFromState(formKey, subject, type))
            .then(({value}) => ownProps.history.push(relativeLink(value.subject)));
    }
});

// Please note that withRoute must be applied after connect
// in order to have the history available in mapDispatchToProps
export default withRouter(connect(mapStateToProps, mapDispatchToProps)(VocabularyBrowserContainer));
