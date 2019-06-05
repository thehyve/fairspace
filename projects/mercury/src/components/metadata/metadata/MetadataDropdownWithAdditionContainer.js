import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import InputWithAddition from "../common/values/InputWithAddition";
import LinkedDataDropdown from "../common/LinkedDataDropdown";
import {getVocabulary, hasVocabularyError, isVocabularyPending} from "../../../reducers/cache/vocabularyReducers";
import {createMetadataEntityFromState, fetchEntitiesIfNeeded} from "../../../actions/metadataActions";
import {createMetadataIri, partitionErrors} from "../../../utils/linkeddata/metadataUtils";
import {emptyLinkedData} from "../../../utils/linkeddata/jsonLdConverter";
import {ErrorDialog} from "../../common";
import ValidationErrorsDisplay from '../common/ValidationErrorsDisplay';

const MetadataDropdownWithAdditionContainer = props => (
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
        requireIdentifier
    >
        <LinkedDataDropdown
            property={props.property}
            onChange={props.onChange}
        />
    </InputWithAddition>
);

MetadataDropdownWithAdditionContainer.propTypes = {
    shape: PropTypes.object.isRequired,
    emptyData: PropTypes.array.isRequired,
    property: PropTypes.object.isRequired,
    onChange: PropTypes.func.isRequired,
    onCreate: PropTypes.func.isRequired,

    error: PropTypes.bool,
    pending: PropTypes.bool
};

const mapStateToProps = (state, ownProps) => {
    const vocabulary = getVocabulary(state);
    const pending = isVocabularyPending(state);
    const error = hasVocabularyError(state);

    const shape = (!pending && !error) ? vocabulary.determineShapeForType(ownProps.property.className) : {};
    const emptyData = emptyLinkedData(vocabulary, shape);

    const onError = (e, id) => {
        if (e.details) {
            ErrorDialog.renderError(ValidationErrorsDisplay, partitionErrors(e.details, createMetadataIri(id)), e.message);
        } else {
            ErrorDialog.showError(e, `Error creating a new metadata entity.\n${e.message}`);
        }
    };

    return {pending, error, shape, emptyData, onError};
};

const mapDispatchToProps = (dispatch, ownProps) => ({
    fetchEntities: fetchEntitiesIfNeeded,
    onCreate: (formKey, shape, id) => {
        const subject = createMetadataIri(id);
        const type = ownProps.property.className;
        return dispatch(createMetadataEntityFromState(formKey, subject, type));
    }
});

export default connect(mapStateToProps, mapDispatchToProps)(MetadataDropdownWithAdditionContainer);
