import {connect} from 'react-redux';
import {fetchMetadataBySubjectIfNeeded} from "../../../actions/metadataActions";
import {fetchMetadataVocabularyIfNeeded} from "../../../actions/vocabularyActions";
import {
    getVocabulary,
    hasVocabularyError,
    isVocabularyPending
} from "../../../selectors/vocabularySelectors";
import {getTypeInfo, isDateTimeProperty, linkLabel, propertiesToShow, url2iri} from "../../../utils/metadataUtils";
import {MetaEntity} from "../common/MetaEntity";
import {hasMetaVocabularyError, isMetaVocabularyPending} from "../../../selectors/metaVocabularySelectors";

const mapStateToProps = (state, ownProps) => {
    const subject = ownProps.subject || url2iri(window.location.href);
    const metadata = getVocabulary(state).get(subject);

    const hasNoMetadata = !metadata || metadata.length === 0;
    const hasOtherErrors = hasVocabularyError(state) || hasMetaVocabularyError(state);
    const error = hasNoMetadata || hasOtherErrors ? 'An error occurred while loading metadata.' : '';

    // Find information on the type
    const typeInfo = getTypeInfo(metadata);
    const label = linkLabel(subject);
    const editable = Object.prototype.hasOwnProperty.call(ownProps, "editable") ? ownProps.editable : true;

    const properties = hasNoMetadata ? [] : propertiesToShow(metadata)
        .map(p => ({
            ...p,
            editable: editable && !isDateTimeProperty(p)
        }));

    return {
        loading: isVocabularyPending(state, subject) || isMetaVocabularyPending(state),
        properties,
        subject,
        typeInfo,
        label,
        error,
        showHeader: ownProps.showHeader || false,
        editable,
    };
};

const mapDispatchToProps = {
    fetchShapes: fetchMetadataVocabularyIfNeeded,
    fetchData: fetchMetadataBySubjectIfNeeded
}

export default connect(mapStateToProps, mapDispatchToProps)(MetaEntity);
