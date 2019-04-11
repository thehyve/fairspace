import React from 'react';
import PropTypes from 'prop-types';
import {List} from '@material-ui/core';

import {ErrorMessage, LoadingInlay} from "../../common";
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

    render() {
        const {
            subject, properties, editable, error, loading
        } = this.props;

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

        return (
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
        );
    }
}

LinkedDataEntityForm.propTypes = {
    initializeForm: PropTypes.func,
    handleAdd: PropTypes.func,
    handleChange: PropTypes.func,
    handleDelete: PropTypes.func,
    updates: PropTypes.object,

    fetchShapes: PropTypes.func,
    fetchLinkedData: PropTypes.func,
    error: PropTypes.string,

    loading: PropTypes.bool,
    editable: PropTypes.bool,

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

    updates: {}
};

export default LinkedDataEntityForm;
