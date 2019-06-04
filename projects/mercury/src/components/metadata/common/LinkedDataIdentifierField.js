import {TextField} from "@material-ui/core";
import React from "react";
import {isValidLinkedDataIdentifier} from "../../../utils/linkeddata/metadataUtils";

export const LinkedDataIdentifierField = props => (
    <TextField
        {...props}
        autoFocus
        label="Identifier"
        fullWidth
        error={props.required ? !isValidLinkedDataIdentifier(props.value) : false}
    />
);
