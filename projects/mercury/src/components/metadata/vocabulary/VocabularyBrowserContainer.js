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
import {getLabel, relativeLink} from "../../../utils/metadataUtils";
import * as vocabularyActions from "../../../actions/vocabularyActions";
import LinkedDataBrowser from "../common/LinkedDataBrowser";

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
        shapes: metaVocabulary.getFairspaceClasses(),
        entities
    });
};

const mapDispatchToProps = (dispatch, ownProps) => ({
    fetchLinkedData: () => dispatch(vocabularyActions.fetchAllVocabularyEntitiesIfNeeded()),
    fetchShapes: () => dispatch(vocabularyActions.fetchMetaVocabularyIfNeeded()),
    create: (shape, id) => dispatch(vocabularyActions.createVocabularyEntity(shape, id))
        .then((response) => {
            dispatch(vocabularyActions.fetchAllVocabularyEntitiesIfNeeded());
            ownProps.history.push(relativeLink(response.value));
        })
});

// Please note that withRoute must be applied after connect
// in order to have the history available in mapDispatchToProps
export default withRouter(connect(mapStateToProps, mapDispatchToProps)(LinkedDataBrowser));
