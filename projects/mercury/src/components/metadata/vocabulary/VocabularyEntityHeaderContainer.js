import {connect} from "react-redux";

import {getTypeInfo, linkLabel, url2iri} from "../../../utils/linkeddata/metadataUtils";
import LinkedDataEntityHeader from "../common/LinkedDataEntityHeader";
import {
    getMetaVocabulary,
    getVocabulary,
    hasMetaVocabularyError,
    hasVocabularyError,
    isMetaVocabularyPending,
    isVocabularyPending
} from "../../../reducers/cache/vocabularyReducers";
import {fromJsonLd} from "../../../utils/linkeddata/jsonLdConverter";

const mapStateToProps = (state) => {
    const subject = url2iri(window.location.href);
    const vocabulary = getVocabulary(state);
    const metaVocabulary = getMetaVocabulary(state);
    const loading = isVocabularyPending(state) || isMetaVocabularyPending(state);
    const metadata = loading ? [] : fromJsonLd(vocabulary.getRaw(), subject, metaVocabulary);
    const hasNoMetadata = !metadata || metadata.length === 0;
    const hasOtherErrors = hasVocabularyError(state) || hasMetaVocabularyError(state);
    if (hasNoMetadata || hasOtherErrors) {
        return {
            error: true
        };
    }
    const header = linkLabel(subject);
    const {label, description} = getTypeInfo(metadata);

    return {
        loading,
        header,
        label,
        description
    };
};

export default connect(mapStateToProps)(LinkedDataEntityHeader);
