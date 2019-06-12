import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import InputWithAddition from "../common/values/InputWithAddition";
import VocabularyDropdownContainer from "./VocabularyDropdownContainer";
import {
    getMetaVocabulary,
    hasMetaVocabularyError,
    isMetaVocabularyPending
} from "../../../reducers/cache/vocabularyReducers";
import {createVocabularyIri, partitionErrors} from "../../../utils/linkeddata/metadataUtils";
import {createVocabularyEntityFromState, fetchVocabularyEntitiesIfNeeded} from "../../../actions/vocabularyActions";
import {emptyLinkedData} from "../../../utils/linkeddata/jsonLdConverter";
import {ErrorDialog} from "../../common";
import ValidationErrorsDisplay from '../common/ValidationErrorsDisplay';

const VocabularyDropdownWithAdditionContainer = props => (
    <InputWithAddition
        shape={props.shape}
        emptyData={props.emptyData}
        property={props.property}
        onChange={props.onChange}
        onCreate={props.onCreate}
        fetchEntities={props.fetchEntities}
        error={props.error}
        pending={props.pending}
        onError={props.onError}
        requireIdentifier={false}
    >
        <VocabularyDropdownContainer
            property={props.property}
            entry={props.entry}
            onChange={props.onChange}
        />
    </InputWithAddition>
);

VocabularyDropdownWithAdditionContainer.propTypes = {
    shape: PropTypes.object.isRequired,
    emptyData: PropTypes.array.isRequired,
    property: PropTypes.object.isRequired,
    entry: PropTypes.object,
    onChange: PropTypes.func.isRequired,
    onCreate: PropTypes.func.isRequired,

    error: PropTypes.bool,
    pending: PropTypes.bool
};

const mapStateToProps = (state, ownProps) => {
    const metaVocabulary = getMetaVocabulary(state);
    const pending = isMetaVocabularyPending(state);
    const error = hasMetaVocabularyError(state);

    const shape = (!pending && !error) ? metaVocabulary.determineShapeForTypes([ownProps.property.className]) : {};
    const emptyData = emptyLinkedData(metaVocabulary, shape);

    const onError = (e, id) => {
        if (e.details) {
            ErrorDialog.renderError(ValidationErrorsDisplay, partitionErrors(e.details, createVocabularyIri(id)), e.message);
        } else {
            ErrorDialog.showError(e, `Error creating a new vocabulary.\n${e.message}`);
        }
    };

    return {pending, error, shape, emptyData, onError};
};


const mapDispatchToProps = (dispatch, ownProps) => ({
    fetchEntities: fetchVocabularyEntitiesIfNeeded,
    onCreate: (formKey, shape, subject) => {
        const type = ownProps.property.className;
        return dispatch(createVocabularyEntityFromState(formKey, subject, type));
    }
});

export default connect(mapStateToProps, mapDispatchToProps)(VocabularyDropdownWithAdditionContainer);
