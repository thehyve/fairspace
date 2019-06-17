import React from "react";
import {connect} from 'react-redux';

import LinkedDataDropdown from "../common/LinkedDataDropdown";
import {LoadingInlay, MessageDisplay} from "../../common";
import {getVocabulary, hasVocabularyError, isVocabularyPending} from "../../../reducers/cache/vocabularyReducers";

const MetadataDropdownContainer = ({types, loading, error, ...otherProps}) => {
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
    const loading = isVocabularyPending(state);
    const loadingError = hasVocabularyError(state);

    if (loadingError) {
        return {
            error: {message: 'Unable to fetch options'}
        };
    }

    const types = vocabulary.getDescendants(property.className);

    return {
        loading,
        types
    };
};

export default connect(mapStateToProps)(MetadataDropdownContainer);
