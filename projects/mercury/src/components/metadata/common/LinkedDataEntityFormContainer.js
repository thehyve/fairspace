import React from "react";
import PropTypes from "prop-types";
import {connect} from "react-redux";
import {LinkedDataEntityForm} from "./LinkedDataEntityForm";
import {getMetadataFormUpdates} from "../../../reducers/metadataFormReducers";
import {
    addMetadataValue,
    deleteMetadataValue,
    initializeMetadataForm,
    updateMetadataValue
} from "../../../actions/metadataFormActions";

class LinkedDataEntityFormContainer extends React.Component {
    componentDidMount() {
        this.initialize();
    }

    componentDidUpdate(prevProps) {
        if (this.props.formKey !== prevProps.formKey) {
            this.initialize();
        }
    }

    initialize() {
        const {formKey, subject, initializeForm, fetchShapes, fetchLinkedData} = this.props;

        if (formKey) {
            initializeForm(formKey, subject);
            fetchShapes();
            fetchLinkedData(subject);
        }
    }

    render() {
        const propertiesWithChanges = this.props.properties.map(p => ({
            ...p,
            values: this.props.updates[p.key] || p.values
        }));

        return (
            <LinkedDataEntityForm
                onAdd={this.props.onAdd}
                onChange={this.props.onChange}
                onDelete={this.props.onDelete}

                error={this.props.error}
                loading={this.props.loading}
                editable={this.props.editable}

                properties={propertiesWithChanges}
            />
        );
    }
}

LinkedDataEntityFormContainer.propTypes = {
    initializeForm: PropTypes.func,
    fetchShapes: PropTypes.func,
    fetchLinkedData: PropTypes.func,

    onAdd: PropTypes.func,
    onChange: PropTypes.func,
    onDelete: PropTypes.func,

    error: PropTypes.string,

    loading: PropTypes.bool,
    editable: PropTypes.bool,

    formKey: PropTypes.string.isRequired,
    subject: PropTypes.string,

    properties: PropTypes.array,
    updates: PropTypes.object
};

LinkedDataEntityFormContainer.defaultProps = {
    fetchShapes: () => {},
    fetchLinkedData: () => {},

    onAdd: () => {},
    onChange: () => {},
    onDelete: () => {},

    properties: [],
    updates: {},
    editable: true
};

const mapStateToProps = (state, ownProps) => ({
    updates: getMetadataFormUpdates(state, ownProps.formKey),
});

const mapDispatchToProps = (dispatch, ownProps) => ({
    initializeForm: (formKey, subject) => dispatch(initializeMetadataForm(formKey, subject)),
    onAdd: (property, value) => {
        dispatch(addMetadataValue(ownProps.formKey, property, value));
    },
    onChange: (property, value, index) => {
        dispatch(updateMetadataValue(ownProps.formKey, property, value, index));
    },
    onDelete: (property, index) => {
        dispatch(deleteMetadataValue(ownProps.formKey, property, index));
    }
});

export default connect(mapStateToProps, mapDispatchToProps)(LinkedDataEntityFormContainer);
