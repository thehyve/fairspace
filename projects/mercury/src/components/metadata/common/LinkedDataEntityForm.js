import React from 'react';
import PropTypes from 'prop-types';
import {Button, Grid, List, Paper} from '@material-ui/core';

import {ErrorMessage, LoadingInlay} from "../../common";
import ErrorDialog from "../../common/ErrorDialog";

import LinkedDataEntityHeader from './LinkedDataEntityHeader';
import LinkedDataProperty from "./LinkedDataProperty";

export class LinkedDataEntityForm extends React.Component {
    state = {
        propertiesWithUpdatedValues: {}
    };

    componentDidMount() {
        this.load();
    }

    componentDidUpdate(prevProps) {
        if (this.props.subject !== prevProps.subject) {
            this.resetChanges();
            this.load();
        } else if (this.anyPendingChanges()) {
            this.load();
        }
    }

    load() {
        const {subject, fetchShapes, fetchLinkedData} = this.props;

        if (subject) {
            fetchShapes();
            fetchLinkedData(subject);
        }
    }

    updateState = (propertyKey, updatedValues) => {
        this.setState(prevState => ({
            propertiesWithUpdatedValues:
                {...prevState.propertiesWithUpdatedValues, [propertyKey]: updatedValues}
        }));
    };

    handleChange = (property, value, index) => {
        const pendingValues = this.state.propertiesWithUpdatedValues[property.key];
        const values = pendingValues || property.values;
        const updatedValues = values.map((el, idx) => ((idx === index) ? value : el));
        this.updateState(property.key, updatedValues);
    };

    handleAdd = (property, value) => {
        const updatedValues = [...property.values, value];
        this.updateState(property.key, updatedValues);
    };

    handleDelete = (property, index) => {
        const pendingValues = this.state.propertiesWithUpdatedValues[property.key];
        const values = pendingValues || property.values;
        const updatedValues = values.filter((el, idx) => idx !== index);
        this.updateState(property.key, updatedValues);
    };

    handleSubmit = () => {
        const {subject, updateEntity} = this.props;

        updateEntity(subject, this.state.propertiesWithUpdatedValues, this.props.vocabulary)
            .then(this.resetChanges)
            .catch(e => ErrorDialog.showError(e, "Error while updating metadata"));
    };

    anyPendingChanges = () => Object.keys(this.state.propertiesWithUpdatedValues).length !== 0;

    shouldShowSubmitButton = () => this.props.editable && this.anyPendingChanges();

    resetChanges = () => {
        this.setState({propertiesWithUpdatedValues: {}});
    }

    render() {
        const {
            subject, label, typeInfo, properties, editable, error, loading, showHeader
        } = this.props;
        const submitButtonVisibility = editable ? 'visible' : 'hidden';

        if (error) {
            return <ErrorMessage message={error.message} />;
        }

        if (loading) {
            return <LoadingInlay />;
        }

        const propertiesWithChanges = properties.map(p => ({
            ...p,
            values: this.state.propertiesWithUpdatedValues[p.key] || p.values
        }));

        const entity = (
            <Grid container>
                <Grid
                    item
                    xs={12}
                >
                    <List dense>
                        {
                            propertiesWithChanges.map((p) => (
                                <LinkedDataProperty
                                    editable={editable && p.editable}
                                    subject={subject}
                                    key={subject + p.key}
                                    property={p}
                                    onChange={(value, index) => this.handleChange(p, value, index)}
                                    onAdd={(value) => this.handleAdd(p, value)}
                                    onDelete={(index) => this.handleDelete(p, index)}
                                />
                            ))
                        }
                    </List>
                </Grid>
                <Grid item>
                    <Button
                        onClick={this.handleSubmit}
                        color="primary"
                        disabled={!this.shouldShowSubmitButton()}
                        style={{visibility: submitButtonVisibility}}
                    >
                        Update
                    </Button>
                </Grid>
            </Grid>
        );

        return showHeader ? (
            <>
                <LinkedDataEntityHeader label={label} typeInfo={typeInfo} />
                <Paper style={{paddingLeft: 20}}>
                    {entity}
                </Paper>
            </>
        ) : entity;
    }
}

LinkedDataEntityForm.propTypes = {
    updateEntity: PropTypes.func,
    fetchShapes: PropTypes.func,
    fetchLinkedData: PropTypes.func,
    error: PropTypes.string,

    loading: PropTypes.bool,
    showHeader: PropTypes.bool,
    editable: PropTypes.bool,

    label: PropTypes.string,
    typeInfo: PropTypes.string,

    subject: PropTypes.string.isRequired,
    properties: PropTypes.array,
};

LinkedDataEntityForm.defaultProps = {
    fetchShapes: () => {},
    fetchLinkedData: () => {},
    updateEntity: () => {}
};

export default LinkedDataEntityForm;
