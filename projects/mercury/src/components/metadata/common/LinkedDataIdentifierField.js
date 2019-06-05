import {TextField} from "@material-ui/core";
import React from "react";
import {isValidLinkedDataIdentifier} from "../../../utils/linkeddata/metadataUtils";

export const LinkedDataIdentifierField = props => (
    <TextField
        {...props}
        label="Identifier"
        fullWidth
        error={props.required ? !isValidLinkedDataIdentifier(props.value) : false}
        helperText={props.required ? 'Enter a valid identifier for this entity' : 'If not provided, the identifier will be inferred from the other properties'}
    />
);
