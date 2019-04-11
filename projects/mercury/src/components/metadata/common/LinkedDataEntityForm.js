import React from 'react';
import PropTypes from 'prop-types';
import {Button, Grid, List, Paper} from '@material-ui/core';

import {ErrorMessage, LoadingInlay} from "../../common";
import ErrorDialog from "../../common/ErrorDialog";

import LinkedDataEntityHeader from './LinkedDataEntityHeader';
import LinkedDataProperty from "./LinkedDataProperty";

export class LinkedDataEntityForm extends React.Component {
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

    handleSubmit = () => {
        const {subject, updateEntity} = this.props;

        updateEntity(subject, this.props.updates, this.props.vocabulary)
            .then(this.resetChanges)
            .catch(e => ErrorDialog.showError(e, "Error while updating metadata"));
    };

    anyPendingChanges = () => Object.keys(this.props.updates).length !== 0;

    shouldShowSubmitButton = () => this.props.editable && this.anyPendingChanges();

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
            values: this.props.updates[p.key] || p.values
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
                                    onChange={(value, index) => this.props.handleChange(p, value, index)}
                                    onAdd={(value) => this.props.handleAdd(p, value)}
                                    onDelete={(index) => this.props.handleDelete(p, index)}
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
    initializeForm: PropTypes.func,
    handleAdd: PropTypes.func,
    handleChange: PropTypes.func,
    handleDelete: PropTypes.func,
    updates: PropTypes.object,

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
    properties: PropTypes.array
};

LinkedDataEntityForm.defaultProps = {
    fetchShapes: () => {},
    fetchLinkedData: () => {},
    initializeForm: () => {},

    handleAdd: () => {},
    handleChange: () => {},
    handleDelete: () => {},
    updateEntity: () => {},

    updates: {}
};

export default LinkedDataEntityForm;
