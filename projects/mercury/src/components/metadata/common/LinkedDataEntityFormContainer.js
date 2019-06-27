import React from "react";
import PropTypes from "prop-types";
import {connect} from "react-redux";
import {Button, Grid} from "@material-ui/core";

import LinkedDataEntityForm from "./LinkedDataEntityForm";
import {getLinkedDataFormUpdates, getLinkedDataFormValidations} from "../../../reducers/linkedDataFormReducers";
import {
    addLinkedDataValue,
    deleteLinkedDataValue,
    initializeLinkedDataForm,
    updateLinkedDataValue,
    validateLinkedDataProperty
} from "../../../actions/linkedDataFormActions";
import {propertiesToShow} from "../../../utils/linkeddata/metadataUtils";
import LinkedDataContext from '../../../LinkedDataContext';

export class LinkedDataEntityFormContainer extends React.Component {
    static contextType = LinkedDataContext;

    componentDidMount() {
        this.initialize();
        this.context.fetchLinkedData(this.props.subject);
    }

    componentDidUpdate(prevProps) {
        if (this.props.formKey !== prevProps.formKey) {
            this.initialize();
        }
    }

    initialize() {
        const {formKey, initializeForm, subject} = this.props;

        initializeForm(formKey || subject);
    }

    render() {
        const {subject} = this.props;
        const {isEditable, onSubmit, getProperties, getLinkedDataError, isLinkedDataLoading, hasLinkedDataFormUpdates, hasLinkedDataFormValidationErrors} = this.context;

        const editable = ("isEditable" in this.props) ? this.props.isEditable : isEditable;
        const properties = getProperties(subject);

        const propertiesWithChanges = propertiesToShow(properties)
            .filter(p => p.isEditable || p.values.length)
            .map(p => ({
                ...p,
                values: this.props.updates[p.key] || p.values,
                errors: this.props.errors[p.key]
            }));

        const error = getLinkedDataError(subject);
        const loading = isLinkedDataLoading(subject);

        // <LinkedDataEntityForm
        //     onAdd={this.props.onAdd}
        //     onChange={this.props.onChange}
        //     onDelete={this.props.onDelete}

        //     error={this.props.error}
        //     loading={this.props.loading}

        //     properties={propertiesWithChanges}
        //     {...otherProps}
        // />

        return (

            <Grid container>
                <Grid item xs={12}>
                    <LinkedDataEntityForm
                        {...this.props}
                        error={error}
                        loading={loading}
                        properties={propertiesWithChanges}
                    />
                </Grid>
                {
                    editable && !error
                    && (
                        <Grid item>
                            <Button
                                onClick={() => onSubmit(subject)}
                                color="primary"
                                disabled={!hasLinkedDataFormUpdates(subject) || hasLinkedDataFormValidationErrors(subject)}
                            >
                                Update
                            </Button>
                        </Grid>
                    )
                }
            </Grid>

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
