import {connect} from "react-redux";
import {LinkedDataEntityForm} from "./LinkedDataEntityForm";
import {getMetadataFormUpdates} from "../../../reducers/metadataFormReducers";
import {
    addMetadataValue,
    deleteMetadataValue,
    initializeMetadataForm,
    updateMetadataValue
} from "../../../actions/metadataFormActions";

const mapStateToProps = (state, ownProps) => ({
    updates: getMetadataFormUpdates(state, ownProps.subject)
});

const mapDispatchToProps = (dispatch, ownProps) => ({
    initializeForm: (subject) => dispatch(initializeMetadataForm(subject)),
    handleAdd: (property, value) => {
        dispatch(addMetadataValue(ownProps.subject, property, value));
    },
    handleChange: (property, value, index) => {
        dispatch(updateMetadataValue(ownProps.subject, property, value, index));
    },
    handleDelete: (property, index) => {
        dispatch(deleteMetadataValue(ownProps.subject, property, index));
    }
});


export default connect(mapStateToProps, mapDispatchToProps)(LinkedDataEntityForm);
