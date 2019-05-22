import {connect} from 'react-redux';
import {withRouter} from 'react-router-dom';

import {createMetadataIri, getLabel, relativeLink, partitionErrors, linkLabel} from "../../../utils/linkeddata/metadataUtils";
import {createMetadataEntityFromState} from "../../../actions/metadataActions";
import {fetchMetadataVocabularyIfNeeded} from "../../../actions/vocabularyActions";
import {searchMetadata} from "../../../actions/searchActions";
import {getVocabulary} from "../../../reducers/cache/vocabularyReducers";
import {getMetadataSearchResults} from "../../../reducers/searchReducers";
import LinkedDataBrowser from "../common/LinkedDataBrowser";
import * as constants from "../../../constants";
import MetadataValueComponentFactory from "./MetadataValueComponentFactory";
import {getFirstPredicateId} from "../../../utils/linkeddata/jsonLdUtils";
import {ErrorDialog} from "../../common";
import ValidationErrorsDisplay from '../common/ValidationErrorsDisplay';

const mapStateToProps = (state) => {
    const {items, pending, error} = getMetadataSearchResults(state);
    const vocabulary = getVocabulary(state);
    const entities = items.map(({id, type, label, name}) => ({
        id,
        label: label || name || linkLabel(id, true),
        type,
        typeLabel: getLabel(vocabulary.determineShapeForType(type), true)
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
        hasError: !!error,
        entities,
        shapes: vocabulary.getClassesInCatalog(),
        valueComponentFactory: MetadataValueComponentFactory,
        vocabulary,
        onError
    };
};

const mapDispatchToProps = (dispatch, ownProps) => ({
    fetchLinkedData: () => dispatch(searchMetadata('*')),
    fetchShapes: () => dispatch(fetchMetadataVocabularyIfNeeded()),
    create: (formKey, shape, id) => {
        const subject = createMetadataIri(id);
        const type = getFirstPredicateId(shape, constants.SHACL_TARGET_CLASS);
        return dispatch(createMetadataEntityFromState(formKey, subject, type))
            .then(({value}) => {
                dispatch(searchMetadata());
                ownProps.history.push(relativeLink(value.subject));
            });
    }
});

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(LinkedDataBrowser));
