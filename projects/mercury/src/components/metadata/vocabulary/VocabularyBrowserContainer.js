import React from "react";
import {connect} from 'react-redux';
import {withRouter} from 'react-router-dom';

import {createVocabularyIri, relativeLink, partitionErrors, linkLabel} from "../../../utils/linkeddata/metadataUtils";
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
import {SHACL_TARGET_CLASS} from "../../../constants";

const VocabularyBrowserContainer = ({entities, total, hasHighlights, footerRender, ...otherProps}) => (
    <LinkedDataValuesContext.Provider value={VocabularyValueComponentFactory}>
        <LinkedDataCreator {...otherProps}>
            {
                entities && entities.length > 0
                    ? (
                        <VocabularyList
                            items={entities}
                            total={total}
                            hasHighlights={hasHighlights}
                            footerRender={footerRender}
                        />
                    )
                    : <MessageDisplay message="The vocabulary is empty" isError={false} />
            }
        </LinkedDataCreator>
    </LinkedDataValuesContext.Provider>
);

const mapStateToProps = (state, {metaVocabulary}) => {
    const {items, pending, error, total} = getVocabularySearchResults(state);
    const entities = items.map(({id, type, label, name, highlights}) => ({
        id,
        label: (label && label[0]) || (name && name[0]) || linkLabel(id, true),
        type: type[0],
        shape: type[0] ? metaVocabulary.determineShapeForType(type[0]) : {},
        highlights
    }));
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
        const subject = createVocabularyIri(id);
        const type = getFirstPredicateId(shape, SHACL_TARGET_CLASS);

        return dispatch(createVocabularyEntityFromState(formKey, subject, type))
            .then(({value}) => ownProps.history.push(relativeLink(value.subject)));
    }
});

// Please note that withRoute must be applied after connect
// in order to have the history available in mapDispatchToProps
export default withRouter(connect(mapStateToProps, mapDispatchToProps)(VocabularyBrowserContainer));
