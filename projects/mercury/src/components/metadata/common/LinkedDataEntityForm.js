import React from 'react';
import PropTypes from 'prop-types';
import {List} from '@material-ui/core';

import {ErrorMessage, LoadingInlay} from "../../common";
import LinkedDataProperty from "./LinkedDataProperty";

export const LinkedDataEntityForm = ({
    properties, editable, error, loading, onChange, onAdd, onDelete, valueComponentFactory
}) => {
    if (error) {
        return <ErrorMessage message={error} />;
    }

    if (loading) {
        return <LoadingInlay />;
    }

    return (
        <List dense>
            {
                properties.map((p) => (
                    <LinkedDataProperty
                        editable={editable}
                        key={p.key}
                        property={p}
                        onChange={(value, index) => onChange(p, value, index)}
                        onAdd={(value) => onAdd(p, value)}
                        onDelete={(index) => onDelete(p, index)}
                        valueComponentFactory={valueComponentFactory}
                    />
                ))
            }
        </List>
    );
};

LinkedDataEntityForm.propTypes = {
    onAdd: PropTypes.func,
    onChange: PropTypes.func,
    onDelete: PropTypes.func,

    error: PropTypes.string,

    loading: PropTypes.bool,
    editable: PropTypes.bool,

    properties: PropTypes.array,

    valueComponentFactory: PropTypes.object
};

LinkedDataEntityForm.defaultProps = {
    onAdd: () => {},
    onChange: () => {},
    onDelete: () => {},

    properties: []
};

export default LinkedDataEntityForm;
