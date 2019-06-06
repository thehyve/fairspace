import {connect} from "react-redux";

import {getCombinedMetadataForSubject, isMetadataPending, hasMetadataError} from "../../../reducers/cache/jsonLdBySubjectReducers";
import {linkLabel} from "../../../utils/linkeddata/metadataUtils";
import {getVocabulary, hasVocabularyError, isVocabularyPending} from "../../../reducers/cache/vocabularyReducers";
import LinkedDataEntityHeader from "../common/LinkedDataEntityHeader";
import {getFirstPredicateId} from "../../../utils/linkeddata/jsonLdUtils";
import {SHACL_TARGET_CLASS} from "../../../constants";

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
    const types = metadata && (metadata.find(prop => prop.key === '@type') || {}).values || [];
    const shape = getVocabulary(state).determineShapeForTypes(types.map(t => t.id));
    const type = getFirstPredicateId(shape, SHACL_TARGET_CLASS);
    const {label, description} = types.find(t => t.id === type);

    return {
        loading,
        header,
        label,
        description
    };
};

export default connect(mapStateToProps)(LinkedDataEntityHeader);
