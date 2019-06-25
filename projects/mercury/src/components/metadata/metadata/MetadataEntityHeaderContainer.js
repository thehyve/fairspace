import React from "react";

import {connect} from "react-redux";
import {
    getCombinedMetadataForSubject,
    hasMetadataError,
    isMetadataPending
} from "../../../reducers/cache/jsonLdBySubjectReducers";
import {getTypeInfo} from "../../../utils/linkeddata/metadataUtils";
import {getVocabulary, hasVocabularyError, isVocabularyPending} from "../../../reducers/cache/vocabularyReducers";
import LinkedDataEntityHeader from "../common/LinkedDataEntityHeader";
import Iri from "../../common/Iri";
import IriTooltip from "../../common/IriTooltip";

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
    const header = <IriTooltip title={subject}><Iri iri={subject} /></IriTooltip>;
    const {label, description} = getTypeInfo(metadata, getVocabulary(state));

    return {
        loading,
        header,
        label,
        description
    };
};

export default connect(mapStateToProps)(LinkedDataEntityHeader);
