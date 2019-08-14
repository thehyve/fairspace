import React from 'react';
import PropTypes from 'prop-types';
import {List, ListItem} from '@material-ui/core';

import {MessageDisplay, LoadingInlay} from "../../common";
import LinkedDataProperty from "./LinkedDataProperty";
import {compareBy, comparing} from "../../../utils/genericUtils";
import {hasValue, shouldPropertyBeHidden} from "../../../utils/linkeddata/metadataUtils";

export const LinkedDataEntityForm = ({
    properties = [],
    values = {},
    validationErrors = {},
    error = false,
    loading = false,
    onChange = () => {},
    onAdd = () => {},
    onDelete = () => {},
    onMultiLineCtrlEnter = () => {},
    onBlur,
}) => {
    if (error) {
        return <MessageDisplay message={error} />;
    }

    if (loading) {
        return <LoadingInlay />;
    }

    const primaryType = values['@type'] && values['@type'][0] && values['@type'][0].id;

    return (
        <List dense>
            {
                properties
                    // Some properties are always hidden (e.g. @type) or hidden based on the type of entity (e.g. label for collection)
                    // Properties are also hidden when it is not editable and there is no value
                    .filter(p => !shouldPropertyBeHidden(p.key, primaryType) && (p.isEditable || hasValue(values[p.key])))

                    // Properties are sorted based on the sh:order property, or by its label otherwise
                    .sort(comparing(
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
                                property={p}
                                values={values[p.key]}
                                validationErrors={validationErrors[p.key]}
                                onAdd={(value) => onAdd(p, value)}
                                onChange={(value, index) => onChange(p, value, index)}
                                onDelete={(index) => onDelete(p, index)}
                                onMultiLineCtrlEnter={onMultiLineCtrlEnter}
                                onBlur={(value, index) => onBlur(p, value, index)}
                            />
                        </ListItem>
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
    properties: PropTypes.array,
    values: PropTypes.object,
    validationErrors: PropTypes.object
};

export default LinkedDataEntityForm;
