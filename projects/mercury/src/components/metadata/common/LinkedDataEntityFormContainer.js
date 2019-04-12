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
        if (this.props.subject !== prevProps.subject) {
            this.initialize();
        }
    }

    initialize() {
        const {subject, initializeForm, fetchShapes, fetchLinkedData} = this.props;

        if (subject) {
            initializeForm(subject);
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
                handleAdd={this.props.handleAdd}
                handleChange={this.props.handleChange}
                handleDelete={this.props.handleDelete}

                error={this.props.error}
                loading={this.props.loading}
                editable={this.props.editable}

                subject={this.props.subject}
                properties={propertiesWithChanges}
            />
        );
    }
}

LinkedDataEntityFormContainer.propTypes = {
    handleAdd: PropTypes.func,
    handleChange: PropTypes.func,
    handleDelete: PropTypes.func,

    error: PropTypes.string,

    loading: PropTypes.bool,
    editable: PropTypes.bool,

    subject: PropTypes.string.isRequired,
    properties: PropTypes.array,
    updates: PropTypes.object
};

LinkedDataEntityFormContainer.defaultProps = {
    handleAdd: () => {},
    handleChange: () => {},
    handleDelete: () => {},

    properties: [],
    updates: {},
    editable: true
};

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

export default connect(mapStateToProps, mapDispatchToProps)(LinkedDataEntityFormContainer);
