import React from "react";
import PropTypes from 'prop-types';
import {FormControl, FormHelperText, FormLabel} from "@material-ui/core";

import IriValueContainer from "./values/IriValueContainer";

export const LinkedDataIdentifierField = props => (
    <FormControl
        required={props.required}
        style={{
            width: '100%',
            margin: 4,
        }}
    >
        <FormLabel component="legend">
            Identifier
        </FormLabel>
        <IriValueContainer {...props} />
        <FormHelperText>
            {props.required ? 'Enter a valid identifier for this entity' : 'If not provided, the identifier will be inferred from the other properties'}
        </FormHelperText>
    </FormControl>
);

LinkedDataIdentifierField.propTypes = {
    localPart: PropTypes.string,
    namespace: PropTypes.object,
    onLocalPartChange: PropTypes.func,
    onNamespaceChange: PropTypes.func,
    namespaces: PropTypes.arrayOf(
        PropTypes.shape({
            label: PropTypes.string,
            prefix: PropTypes.string,
            namespace: PropTypes.string
        })
    ),
    required: PropTypes.bool
};

export default LinkedDataIdentifierField;
