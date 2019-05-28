import {connect} from 'react-redux';
import {withRouter} from 'react-router-dom';

import {createVocabularyIri, getLabel, relativeLink, partitionErrors, linkLabel} from "../../../utils/linkeddata/metadataUtils";
import {createVocabularyEntityFromState} from "../../../actions/vocabularyActions";
import {searchVocabulary} from "../../../actions/searchActions";
import Config from "../../../services/Config/Config";
import * as constants from "../../../constants";
import LinkedDataBrowser from "../common/LinkedDataBrowser";
import VocabularyValueComponentFactory from "./VocabularyValueComponentFactory";
import {isDataSteward} from "../../../utils/userUtils";
import {getAuthorizations} from "../../../reducers/account/authorizationsReducers";
import {getFirstPredicateId} from "../../../utils/linkeddata/jsonLdUtils";
import {ErrorDialog} from "../../common";
import ValidationErrorsDisplay from '../common/ValidationErrorsDisplay';
import {getVocabularySearchResults} from "../../../reducers/searchReducers";

const mapStateToProps = (state, {vocabulary}) => {
    const {items, pending, error} = getVocabularySearchResults(state);
    const entities = items.map(({id, type, label, name, highlights}) => ({
        id,
        label: (label && label[0]) || (name && name[0]) || linkLabel(id, true),
        type: type[0],
        typeLabel: getLabel(vocabulary.determineShapeForType(type[0]), true),
        highlights
    }));

    const onEntityCreationError = (e, id) => {
        if (e.details) {
            ErrorDialog.renderError(ValidationErrorsDisplay, partitionErrors(e.details, createVocabularyIri(id)), e.message);
        } else {
            ErrorDialog.showError(e, `Error creating a new vocabulary.\n${e.message}`);
        }
    };

    return ({
        editable: isDataSteward(getAuthorizations(state), Config.get()),
        shapes: vocabulary.getClassesInCatalog(),
        loading: pending,
        error,
        entities,
        hasHighlights: entities.some(({highlights}) => highlights.length > 0),
        valueComponentFactory: VocabularyValueComponentFactory,
        vocabulary,
        onEntityCreationError
    });
};

const mapDispatchToProps = (dispatch, ownProps) => ({
    fetchLinkedData: () => dispatch(searchVocabulary('*', ownProps.targetClasses)),
    fetchShapes: () => {},
    create: (formKey, shape, id) => {
        const subject = createVocabularyIri(id);
        const type = getFirstPredicateId(shape, constants.SHACL_TARGET_CLASS);

        return dispatch(createVocabularyEntityFromState(formKey, subject, type))
            .then(({value}) => ownProps.history.push(relativeLink(value.subject)));
    }
});

// Please note that withRoute must be applied after connect
// in order to have the history available in mapDispatchToProps
export default withRouter(connect(mapStateToProps, mapDispatchToProps)(LinkedDataBrowser));
