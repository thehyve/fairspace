import React from "react";
import PropTypes from "prop-types";
import {connect} from "react-redux";
import {LinkedDataEntityForm} from "./LinkedDataEntityForm";
import {getLinkedDataFormUpdates} from "../../../reducers/linkedDataFormReducers";
import {
    addLinkedDataValue,
    deleteLinkedDataValue,
    initializeLinkedDataForm,
    updateLinkedDataValue
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

    properties: PropTypes.array,
    updates: PropTypes.object,

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
    editable: true
};

const mapStateToProps = (state, ownProps) => ({
    updates: getLinkedDataFormUpdates(state, ownProps.formKey),
});

const mapDispatchToProps = (dispatch, ownProps) => ({
    initializeForm: (formKey) => dispatch(initializeLinkedDataForm(formKey)),
    onAdd: (property, value) => {
        dispatch(addLinkedDataValue(ownProps.formKey, property, value));
    },
    onChange: (property, value, index) => {
        dispatch(updateLinkedDataValue(ownProps.formKey, property, value, index));
    },
    onDelete: (property, index) => {
        dispatch(deleteLinkedDataValue(ownProps.formKey, property, index));
    }
});

export default connect(mapStateToProps, mapDispatchToProps)(LinkedDataEntityFormContainer);
