import React from 'react';
import PropTypes from 'prop-types';
import {List} from '@material-ui/core';

import {ErrorMessage, LoadingInlay} from "../../common";
import LinkedDataProperty from "./LinkedDataProperty";

export const LinkedDataEntityForm = props => {
    const {
        subject, properties, editable, error, loading
    } = props;

    if (error) {
        return <ErrorMessage message={error.message} />;
    }

    if (loading) {
        return <LoadingInlay />;
    }

    return (
        <List dense>
            {
                properties.map((p) => (
                    <LinkedDataProperty
                        editable={editable && p.editable}
                        subject={subject}
                        key={subject + p.key}
                        property={p}
                        onChange={(value, index) => props.handleChange(p, value, index)}
                        onAdd={(value) => props.handleAdd(p, value)}
                        onDelete={(index) => props.handleDelete(p, index)}
                    />
                ))
            }
        </List>
    );
};

LinkedDataEntityForm.propTypes = {
    handleAdd: PropTypes.func,
    handleChange: PropTypes.func,
    handleDelete: PropTypes.func,

    error: PropTypes.string,

    loading: PropTypes.bool,
    editable: PropTypes.bool,

    subject: PropTypes.string.isRequired,
    properties: PropTypes.array
};

LinkedDataEntityForm.defaultProps = {
    handleAdd: () => {},
    handleChange: () => {},
    handleDelete: () => {},

    properties: []
};

export default LinkedDataEntityForm;
