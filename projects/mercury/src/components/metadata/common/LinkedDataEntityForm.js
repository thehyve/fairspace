import React from 'react';
import PropTypes from 'prop-types';
import {List, ListItem} from '@material-ui/core';

import {MessageDisplay, LoadingInlay} from "../../common";
import LinkedDataProperty from "./LinkedDataProperty";
import {compareBy, comparing} from "../../../utils/genericUtils";
import {hasValue} from "../../../utils/linkeddata/metadataUtils";

export const LinkedDataEntityForm = ({
    properties, error, loading, onChange, onAdd, onDelete
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
                        compareBy(p => (p.order === undefined ? Number.MAX_SAFE_INTEGER : p.order)),
                        compareBy(hasValue, false),
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
                                onChange={(value, index) => onChange(p, value, index)}
                                onAdd={(value) => onAdd(p, value)}
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
};

LinkedDataEntityForm.defaultProps = {
    onAdd: () => {},
    onChange: () => {},
    onDelete: () => {},

    properties: []
};

export default LinkedDataEntityForm;
