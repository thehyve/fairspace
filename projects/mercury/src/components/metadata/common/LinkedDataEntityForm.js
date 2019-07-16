import React from 'react';
import PropTypes from 'prop-types';
import {List, ListItem} from '@material-ui/core';

import {MessageDisplay, LoadingInlay} from "../../common";
import LinkedDataProperty from "./LinkedDataProperty";
import {compareBy, comparing} from "../../../utils/genericUtils";

export const LinkedDataEntityForm = ({
    properties = [],
    values = {},
    error = false,
    loading = false,
    onChange = () => {},
    onAdd = () => {},
    onDelete = () => {}
}) => {
    if (error) {
        return <MessageDisplay message={error} />;
    }

    if (loading) {
        return <LoadingInlay />;
    }

    return (
        <List dense>
            {
                properties
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
                                onAdd={(value) => onAdd(p, value)}
                                onChange={(value, index) => onChange(p, value, index)}
                                onDelete={(index) => onDelete(p, index)}
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
    values: PropTypes.object
};

export default LinkedDataEntityForm;
