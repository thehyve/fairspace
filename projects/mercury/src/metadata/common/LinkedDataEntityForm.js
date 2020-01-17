import React from 'react';
import PropTypes from 'prop-types';
import {List, ListItem} from '@material-ui/core';
import {compareBy, comparing, LoadingInlay, MessageDisplay} from '../../common';

import LinkedDataProperty from "./LinkedDataProperty";
import {hasValue, shouldPropertyBeHidden} from "../../common/utils/linkeddata/metadataUtils";
import {LABEL_URI} from '../../constants';

type PropertyType = {
    key: string;
}
function labelFirst(x: PropertyType, y: PropertyType): number {
    if (x.key === y.key) {
        return 0;
    }
    if (x.key === LABEL_URI) {
        return -1;
    }
    if (y.key === LABEL_URI) {
        return 1;
    }
    return 0;
}

export const LinkedDataEntityForm = ({
    id,
    onSubmit,
    properties = [],
    values = {},
    validationErrors = {},
    errorMessage = '',
    loading = false,
    onChange = () => {},
    onAdd = () => {},
    onDelete = () => {},
    editable = true,
}) => {
    if (loading) {
        return <LoadingInlay />;
    }

    if (errorMessage !== '') {
        return <MessageDisplay message={errorMessage} />;
    }

    const primaryType = values['@type'] && values['@type'][0] && values['@type'][0].id;

    return (
        <form
            id={id}
            onSubmit={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (!editable) {
                    onSubmit();
                }
            }}
            noValidate
        >
            <List>
                {
                    properties
                        // Some properties are always hidden (e.g. @type) or hidden based on the type of entity (e.g. label for collection)
                        // Properties are also hidden when it is not editable and there is no value
                        .filter(p => !shouldPropertyBeHidden(p.key, primaryType) && (p.isEditable || hasValue(values[p.key])))

                        // Properties are sorted based on the sh:order property, or by its label otherwise
                        .sort(comparing(
                            labelFirst,
                            compareBy(p => (typeof p.order === 'number' ? p.order : Number.MAX_SAFE_INTEGER)),
                            compareBy('label')
                        ))
                        .map(p => (
                            <ListItem
                                key={p.key}
                                disableGutters
                                style={{display: 'block'}}
                            >
                                <LinkedDataProperty
                                    formEditable={editable}
                                    property={p}
                                    values={values[p.key]}
                                    validationErrors={validationErrors[p.key]}
                                    onAdd={editable ? (value) => onAdd(p, value) : () => {}}
                                    onChange={editable ? (value, index) => onChange(p, value, index) : () => {}}
                                    onDelete={editable ? (index) => onDelete(p, index) : () => {}}
                                />
                            </ListItem>
                        ))
                }
            </List>
        </form>
    );
};

LinkedDataEntityForm.propTypes = {
    onAdd: PropTypes.func,
    onChange: PropTypes.func,
    onDelete: PropTypes.func,

    errorMessage: PropTypes.string,

    loading: PropTypes.bool,
    properties: PropTypes.array,
    values: PropTypes.object,
    validationErrors: PropTypes.object,
    editable: PropTypes.bool
};

export default LinkedDataEntityForm;
