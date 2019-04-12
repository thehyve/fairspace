import {connect} from 'react-redux';
import * as metadataActions from "../../../actions/metadataActions";
import * as vocabularyActions from "../../../actions/vocabularyActions";
import {isDateTimeProperty, propertiesToShow, url2iri} from "../../../utils/metadataUtils";
import {
    getCombinedMetadataForSubject,
    hasMetadataError,
    isMetadataPending
} from "../../../reducers/cache/jsonLdBySubjectReducers";
import {getVocabulary, hasVocabularyError, isVocabularyPending} from "../../../reducers/cache/vocabularyReducers";
import LinkedDataEntityFormWithButton from "../common/LinkedDataEntityFormWithButton";
import {hasMetadataFormUpdates} from "../../../reducers/metadataFormReducers";

const mapStateToProps = (state, ownProps) => {
    const subject = ownProps.subject || url2iri(window.location.href);
    const metadata = getCombinedMetadataForSubject(state, subject);
    const vocabulary = getVocabulary(state);

    const hasNoMetadata = !metadata || metadata.length === 0;
    const hasOtherErrors = hasMetadataError(state, subject) || hasVocabularyError(state);
    const error = hasNoMetadata || hasOtherErrors ? 'An error occurred while loading metadata.' : '';

    const editable = Object.prototype.hasOwnProperty.call(ownProps, "editable") ? ownProps.editable : true;
    const buttonDisabled = !hasMetadataFormUpdates(state, subject);

    const properties = hasNoMetadata ? [] : propertiesToShow(metadata)
        .map(p => ({
            ...p,
            editable: editable && !isDateTimeProperty(p)
        }));

    return {
        loading: isMetadataPending(state, subject) || isVocabularyPending(state),
        error,

        properties,
        subject,

        editable,
        buttonDisabled,
        vocabulary
    };
};

const mapDispatchToProps = (dispatch) => ({
    fetchShapes: () => dispatch(vocabularyActions.fetchMetadataVocabularyIfNeeded()),
    fetchLinkedData: (subject) => dispatch(metadataActions.fetchMetadataBySubjectIfNeeded(subject)),
    onSubmit: (subject) => dispatch(metadataActions.submitMetadataChangesFromState(subject))
        .then(() => dispatch(metadataActions.fetchMetadataBySubjectIfNeeded(subject)))
});

export default connect(mapStateToProps, mapDispatchToProps)(LinkedDataEntityFormWithButton);
