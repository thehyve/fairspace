import {connect} from "react-redux";

import {getCombinedMetadataForSubject, isMetadataPending, hasMetadataError} from "../../../reducers/cache/jsonLdBySubjectReducers";
import {getTypeInfo, linkLabel} from "../../../utils/linkeddata/metadataUtils";
import {getVocabulary, hasVocabularyError, isVocabularyPending} from "../../../reducers/cache/vocabularyReducers";
import LinkedDataEntityHeader from "../common/LinkedDataEntityHeader";

const mapStateToProps = (state, {subject}) => {
    const metadata = getCombinedMetadataForSubject(state, subject);
    const hasNoMetadata = !metadata || metadata.length === 0;
    const hasOtherErrors = hasMetadataError(state, subject) || hasVocabularyError(state);
    if (hasNoMetadata || hasOtherErrors) {
        return {
            error: true
        };
    }

    const loading = isMetadataPending(state, subject) || isVocabularyPending(state);
    const header = linkLabel(subject);
    const {label, description} = getTypeInfo(metadata, getVocabulary(state));

    return {
        loading,
        header,
        label,
        description
    };
};

export default connect(mapStateToProps)(LinkedDataEntityHeader);
