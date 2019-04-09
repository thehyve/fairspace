import {connect} from 'react-redux';
import {withRouter} from 'react-router-dom';
import {getLabel, relativeLink} from "../../../utils/metadataUtils";
import * as metadataActions from "../../../actions/metadataActions";
import * as vocabularyActions from "../../../actions/vocabularyActions";
import {getVocabulary, isVocabularyPending} from "../../../reducers/cache/vocabularyReducers";
import LinkedDataBrowser from "../common/LinkedDataBrowser";

const mapStateToProps = (state) => {
    const {cache: {allEntities}} = state;
    const pending = isVocabularyPending(state) || !allEntities || allEntities.pending;
    const allEntitiesData = allEntities && allEntities.data ? allEntities.data : [];
    const vocabularyData = getVocabulary(state);
    const entities = allEntitiesData.map(e => ({
        id: e['@id'],
        label: getLabel(e),
        type: e['@type'],
        typeLabel: getLabel(vocabularyData.determineShapeForType(e['@type'][0]), true)
    }));

    return ({
        loading: pending,
        error: allEntities ? allEntities.error : false,
        shapes: vocabularyData && vocabularyData.getFairspaceClasses(),
        entities,
    });
};

const mapDispatchToProps = (dispatch, ownProps) => ({
    fetch: () => dispatch(metadataActions.fetchAllEntitiesIfNeeded()),
    fetchShapes: () => dispatch(vocabularyActions.fetchMetadataVocabularyIfNeeded),
    create: (shape, id) => dispatch(metadataActions.createMetadataEntity(shape, id))
        .then((response) => {
            dispatch(metadataActions.fetchAllEntitiesIfNeeded());
            ownProps.history.push(relativeLink(response.value));
        })
});

// Please note that withRoute must be applied after connect
// in order to have the history available in mapDispatchToProps
export default withRouter(connect(mapStateToProps, mapDispatchToProps)(LinkedDataBrowser));
