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
import {createVocabularyIri} from "../../../utils/linkeddata/metadataUtils";
import VocabularyValueComponentFactory from "./VocabularyValueComponentFactory";
import {createVocabularyEntityFromState, fetchVocabularyEntitiesIfNeeded} from "../../../actions/vocabularyActions";

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
        valueComponentFactory={VocabularyValueComponentFactory}
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

    const shape = (!pending && !error) ? metaVocabulary.determineShapeForType(ownProps.property.className) : {};
    const emptyData = metaVocabulary.emptyLinkedData(shape);

    return {pending, error, shape, emptyData};
};


const mapDispatchToProps = (dispatch, ownProps) => ({
    fetchEntities: fetchVocabularyEntitiesIfNeeded,
    onCreate: (formKey, shape, id) => {
        const subject = createVocabularyIri(id);
        const type = ownProps.property.className;
        return dispatch(createVocabularyEntityFromState(formKey, subject, type));
    }
});

export default connect(mapStateToProps, mapDispatchToProps)(VocabularyDropdownWithAdditionContainer);
