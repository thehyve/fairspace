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
import {createVocabularyIri, getFirstPredicateId, getLabel, relativeLink} from "../../../utils/metadataUtils";
import * as vocabularyActions from "../../../actions/vocabularyActions";
import LinkedDataBrowser from "../common/LinkedDataBrowser";
import * as constants from "../../../constants";
import VocabularyValueComponentFactory from "./VocabularyValueComponentFactory";

const mapStateToProps = (state) => {
    const vocabularyEntities = getVocabularyEntities(state);
    const metaVocabulary = getMetaVocabulary(state);

    const entities = vocabularyEntities.map(e => ({
        id: e['@id'],
        label: getLabel(e),
        type: e['@type'],
        typeLabel: e['@type'] ? getLabel(metaVocabulary.determineShapeForType(e['@type'][0]), true) : ''
    }));

    return ({
        loading: isVocabularyEntitiesPending(state) || isMetaVocabularyPending(state),
        error: hasVocabularyEntitiesError(state) || hasMetaVocabularyError(state),
        shapes: metaVocabulary.getClassesInCatalog(),
        vocabulary: metaVocabulary,
        valueComponentFactory: VocabularyValueComponentFactory,
        entities
    });
};

const mapDispatchToProps = (dispatch, ownProps) => ({
    fetchLinkedData: () => dispatch(vocabularyActions.fetchAllVocabularyEntitiesIfNeeded()),
    fetchShapes: () => dispatch(vocabularyActions.fetchMetaVocabularyIfNeeded()),
    create: (formKey, shape, id) => {
        const subject = createVocabularyIri(id);
        const type = getFirstPredicateId(shape, constants.SHACL_TARGET_CLASS);
        return dispatch(vocabularyActions.createVocabularyEntityFromState(formKey, subject, type))
            .then(({value}) => {
                dispatch(vocabularyActions.fetchAllVocabularyEntitiesIfNeeded());
                ownProps.history.push(relativeLink(value.subject));
            });
    }
});

// Please note that withRoute must be applied after connect
// in order to have the history available in mapDispatchToProps
export default withRouter(connect(mapStateToProps, mapDispatchToProps)(LinkedDataBrowser));
