import {connect} from 'react-redux';
import {withRouter} from 'react-router-dom';
import {createMetadataIri, getLabel, relativeLink, partitionErrors} from "../../../utils/linkeddata/metadataUtils";
import * as metadataActions from "../../../actions/metadataActions";
import * as vocabularyActions from "../../../actions/vocabularyActions";
import {getVocabulary, isVocabularyPending} from "../../../reducers/cache/vocabularyReducers";
import LinkedDataBrowser from "../common/LinkedDataBrowser";
import * as constants from "../../../constants";
import MetadataValueComponentFactory from "./MetadataValueComponentFactory";
import {getFirstPredicateId} from "../../../utils/linkeddata/jsonLdUtils";
import {ErrorDialog} from "../../common";
import ValidationErrorsDisplay from '../common/ValidationErrorsDisplay';

const mapStateToProps = (state) => {
    const {cache: {allEntities}} = state;
    const pending = isVocabularyPending(state) || !allEntities || allEntities.pending;
    const allEntitiesData = allEntities && allEntities.data ? allEntities.data : [];
    const vocabulary = getVocabulary(state);
    const entities = allEntitiesData.map(e => ({
        id: e['@id'],
        label: getLabel(e),
        type: e['@type'],
        typeLabel: getLabel(vocabulary.determineShapeForType(e['@type'][0]), true)
    }));

    const onError = (e, id) => {
        if (e.details) {
            ErrorDialog.renderError(ValidationErrorsDisplay, partitionErrors(e.details, createMetadataIri(id)), e.message);
        } else {
            ErrorDialog.showError(e, `Error creating a new metadata entity.\n${e.message}`);
        }
    };

    return {
        loading: pending,
        error: allEntities ? allEntities.error : false,
        shapes: vocabulary.getClassesInCatalog(),
        valueComponentFactory: MetadataValueComponentFactory,
        vocabulary,
        entities,
        onError
    };
};

const mapDispatchToProps = (dispatch, ownProps) => ({
    fetchLinkedData: () => dispatch(metadataActions.fetchAllEntitiesIfNeeded()),
    fetchShapes: () => dispatch(vocabularyActions.fetchMetadataVocabularyIfNeeded),
    create: (formKey, shape, id) => {
        const subject = createMetadataIri(id);
        const type = getFirstPredicateId(shape, constants.SHACL_TARGET_CLASS);
        return dispatch(metadataActions.createMetadataEntityFromState(formKey, subject, type))
            .then(({value}) => {
                dispatch(metadataActions.fetchAllEntitiesIfNeeded());
                ownProps.history.push(relativeLink(value.subject));
            });
    }
});

// Please note that withRoute must be applied after connect
// in order to have the history available in mapDispatchToProps
export default withRouter(connect(mapStateToProps, mapDispatchToProps)(LinkedDataBrowser));
