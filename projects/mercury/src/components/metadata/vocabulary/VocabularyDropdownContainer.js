import React from "react";
import {connect} from 'react-redux';

import LinkedDataDropdown from "../common/LinkedDataDropdown";
import {LoadingInlay, MessageDisplay} from "../../common";
import {getMetaVocabulary, hasMetaVocabularyError, isMetaVocabularyPending} from "../../../reducers/cache/vocabularyReducers";

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
    const metaVocabulary = getMetaVocabulary(state);
    const loading = isMetaVocabularyPending(state);
    const loadingError = hasMetaVocabularyError(state);

    if (loadingError) {
        return {
            error: {message: 'Unable to fetch options'}
        };
    }

    const types = metaVocabulary.getDescendants(property.className);

    return {
        loading,
        types
    };
};

export default connect(mapStateToProps)(VocabularyDropdownContainer);
