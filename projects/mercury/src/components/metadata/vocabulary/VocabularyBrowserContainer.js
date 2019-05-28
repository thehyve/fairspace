import React from "react";
import {connect} from 'react-redux';
import {withRouter} from 'react-router-dom';
import {
    getMetaVocabulary,
    getVocabularyEntities,
    hasMetaVocabularyError,
    hasVocabularyEntitiesError,
    isMetaVocabularyPending,
    isVocabularyEntitiesPending
} from "../../../reducers/cache/vocabularyReducers";
import {createVocabularyIri, getLabel, partitionErrors, relativeLink} from "../../../utils/linkeddata/metadataUtils";
import * as vocabularyActions from "../../../actions/vocabularyActions";
import Config from "../../../services/Config/Config";
import LinkedDataCreator from "../common/LinkedDataCreator";
import VocabularyValueComponentFactory from "./VocabularyValueComponentFactory";
import {isDataSteward} from "../../../utils/userUtils";
import {getAuthorizations} from "../../../reducers/account/authorizationsReducers";
import {getFirstPredicateId} from "../../../utils/linkeddata/jsonLdUtils";
import {ErrorDialog, MessageDisplay} from "../../common";
import ValidationErrorsDisplay from '../common/ValidationErrorsDisplay';
import VocabularyList from "./VocabularyList";
import {LinkedDataValuesContext} from "../common/LinkedDataValuesContext";
import {SHACL_TARGET_CLASS} from "../../../constants";

const VocabularyBrowserContainer = ({entities, hasHighlights, ...otherProps}) => (
    <LinkedDataValuesContext.Provider value={VocabularyValueComponentFactory}>
        <LinkedDataCreator {...otherProps}>
            {
                entities && entities.length > 0
                    ? <VocabularyList items={entities} hasHighlights={hasHighlights} />
                    : <MessageDisplay message="The metadata is empty" isError={false} />
            }
        </LinkedDataCreator>
    </LinkedDataValuesContext.Provider>
);

const mapStateToProps = (state) => {
    const vocabularyEntities = getVocabularyEntities(state);
    const metaVocabulary = getMetaVocabulary(state);

    const entities = vocabularyEntities.map(e => ({
        id: e['@id'],
        label: getLabel(e),
        type: e['@type'],
        shape: e['@type'] ? metaVocabulary.determineShapeForType(e['@type'][0]) : {}
    }));

    const onError = (e, id) => {
        if (e.details) {
            ErrorDialog.renderError(ValidationErrorsDisplay, partitionErrors(e.details, createVocabularyIri(id)), e.message);
        } else {
            ErrorDialog.showError(e, `Error creating a new vocabulary.\n${e.message}`);
        }
    };

    return ({
        loading: isVocabularyEntitiesPending(state) || isMetaVocabularyPending(state),
        hasError: hasVocabularyEntitiesError(state) || hasMetaVocabularyError(state),
        editable: isDataSteward(getAuthorizations(state), Config.get()),
        shapes: metaVocabulary.getClassesInCatalog(),
        vocabulary: metaVocabulary,
        entities,
        onError
    });
};

const mapDispatchToProps = (dispatch, ownProps) => ({
    fetchLinkedData: () => dispatch(vocabularyActions.fetchAllVocabularyEntitiesIfNeeded()),
    fetchShapes: () => dispatch(vocabularyActions.fetchMetaVocabularyIfNeeded()),
    create: (formKey, shape, id) => {
        const subject = createVocabularyIri(id);
        const type = getFirstPredicateId(shape, SHACL_TARGET_CLASS);

        return dispatch(vocabularyActions.createVocabularyEntityFromState(formKey, subject, type))
            .then(({value}) => {
                dispatch(vocabularyActions.fetchVocabularyEntitiesIfNeeded());
                dispatch(vocabularyActions.fetchAllVocabularyEntitiesIfNeeded());
                ownProps.history.push(relativeLink(value.subject));
            });
    }
});

// Please note that withRoute must be applied after connect
// in order to have the history available in mapDispatchToProps
export default withRouter(connect(mapStateToProps, mapDispatchToProps)(VocabularyBrowserContainer));
