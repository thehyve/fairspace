import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import InputWithAddition from "../common/values/InputWithAddition";
import MetadataDropdownContainer from "./MetadataDropdownContainer";
import {getVocabulary, hasVocabularyError, isVocabularyPending} from "../../../reducers/cache/vocabularyReducers";
import {createMetadataEntityFromState, fetchEntitiesIfNeeded} from "../../../actions/metadataActions";
import {createMetadataIri} from "../../../utils/linkeddata/metadataUtils";
import MetadataValueComponentFactory from "./MetadataValueComponentFactory";

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
        valueComponentFactory={MetadataValueComponentFactory}
    >
        <MetadataDropdownContainer
            property={props.property}
            entry={props.entry}
            onChange={props.onChange}
        />
    </InputWithAddition>
);

MetadataDropdownWithAdditionContainer.propTypes = {
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
    const vocabulary = getVocabulary(state);
    const pending = isVocabularyPending(state);
    const error = hasVocabularyError(state);

    const shape = (!pending && !error) ? vocabulary.determineShapeForType(ownProps.property.className) : {};
    const emptyData = vocabulary.emptyLinkedData(shape);

    return {pending, error, shape, emptyData};
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
