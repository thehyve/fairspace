import React from "react";
import PropTypes from "prop-types";
import {connect} from "react-redux";
import {LinkedDataEntityForm} from "./LinkedDataEntityForm";
import {getLinkedDataFormUpdates, getLinkedDataFormValidations} from "../../../reducers/linkedDataFormReducers";
import {
    addLinkedDataValue,
    deleteLinkedDataValue,
    initializeLinkedDataForm,
    updateLinkedDataValue,
    validateLinkedDataProperty
} from "../../../actions/linkedDataFormActions";

export class LinkedDataEntityFormContainer extends React.Component {
    componentDidMount() {
        this.initialize();
    }

    componentDidUpdate(prevProps) {
        if (this.props.formKey !== prevProps.formKey) {
            this.initialize();
        }
    }

    initialize() {
        const {formKey, initializeForm, fetchShapes, fetchLinkedData} = this.props;

        if (formKey) {
            initializeForm(formKey);
            fetchShapes();
            fetchLinkedData();
        }
    }

    render() {
        const propertiesWithChanges = this.props.properties
            .filter(p => p.isEditable || p.values.length)
            .map(p => ({
                ...p,
                values: this.props.updates[p.key] || p.values,
                errors: this.props.errors[p.key]
            }));

        return (
            <LinkedDataEntityForm
                onAdd={this.props.onAdd}
                onChange={this.props.onChange}
                onDelete={this.props.onDelete}

                error={this.props.error}
                loading={this.props.loading}

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

    formKey: PropTypes.string.isRequired,

    properties: PropTypes.array,
    updates: PropTypes.object,
    errors: PropTypes.object

};

LinkedDataEntityFormContainer.defaultProps = {
    initializeForm: () => {},
    fetchShapes: () => {},
    fetchLinkedData: () => {},

    onAdd: () => {},
    onChange: () => {},
    onDelete: () => {},

    properties: [],
    updates: {},
    errors: {}
};

const mapStateToProps = (state, ownProps) => ({
    updates: getLinkedDataFormUpdates(state, ownProps.formKey),
    errors: getLinkedDataFormValidations(state, ownProps.formKey),
});

const mapDispatchToProps = (dispatch, ownProps) => ({
    initializeForm: (formKey) => dispatch(initializeLinkedDataForm(formKey)),
    onAdd: (property, value) => {
        dispatch(addLinkedDataValue(ownProps.formKey, property, value));
        dispatch(validateLinkedDataProperty(ownProps.formKey, property));
    },
    onChange: (property, value, index) => {
        dispatch(updateLinkedDataValue(ownProps.formKey, property, value, index));
        dispatch(validateLinkedDataProperty(ownProps.formKey, property));
    },
    onDelete: (property, index) => {
        dispatch(deleteLinkedDataValue(ownProps.formKey, property, index));
        dispatch(validateLinkedDataProperty(ownProps.formKey, property));
    }
});

export default connect(mapStateToProps, mapDispatchToProps)(LinkedDataEntityFormContainer);
