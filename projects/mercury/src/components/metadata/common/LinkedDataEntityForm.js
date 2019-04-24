import React from 'react';
import PropTypes from 'prop-types';
import {List} from '@material-ui/core';

import {ErrorMessage, LoadingInlay} from "../../common";
import LinkedDataProperty from "./LinkedDataProperty";

export const LinkedDataEntityForm = props => {
    const {
        properties, editable, error, loading
    } = props;

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
                        onChange={(value, index) => props.onChange(p, value, index)}
                        onAdd={(value) => props.onAdd(p, value)}
                        onDelete={(index) => props.onDelete(p, index)}
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
};

LinkedDataEntityForm.defaultProps = {
    onAdd: () => {},
    onChange: () => {},
    onDelete: () => {},

    properties: []
};

export default LinkedDataEntityForm;
