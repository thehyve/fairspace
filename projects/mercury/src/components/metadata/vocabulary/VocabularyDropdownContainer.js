import React from "react";
import {connect} from 'react-redux';

import LinkedDataDropdown from "../common/LinkedDataDropdown";
import {LoadingInlay, MessageDisplay} from "../../common";
import {
    getMetaVocabulary,
    getVocabulary,
    hasMetaVocabularyError,
    hasVocabularyError,
    isMetaVocabularyPending,
    isVocabularyPending
} from "../../../reducers/cache/vocabularyReducers";

const VocabularyDropdownContainer = ({types, loading, error, ...otherProps}) => {
    if (error) {
        return <MessageDisplay withIcon={false} message={error.message} />;
    }

    if (loading) {
        return <LoadingInlay />;
    }

    return types && <LinkedDataDropdown types={types} {...otherProps} />;
};

const mapStateToProps = (state, {property}) => {
    const vocabulary = getVocabulary(state);
    const metaVocabulary = getMetaVocabulary(state);
    const loading = isVocabularyPending(state) || isMetaVocabularyPending(state);
    const loadingError = hasVocabularyError(state) || hasMetaVocabularyError(state);

    if (loadingError) {
        return {
            error: {message: 'Unable to fetch options'}
        };
    }

    const types = [...vocabulary.getClassHierarchy(property.className), ...metaVocabulary.getClassHierarchy(property.className)];

    return {
        loading,
        types
    };
};

export default connect(mapStateToProps)(VocabularyDropdownContainer);
