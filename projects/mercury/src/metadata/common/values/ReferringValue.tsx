// @ts-nocheck
import React from "react";
import ReactMarkdown from "react-markdown";
import Switch from "@mui/material/Switch";
import {formatDateTime} from "../../../common/utils/genericUtils";
import LinkedDataLink from "../LinkedDataLink";
import {BOOLEAN_URI, DATETIME_URI, MARKDOWN_URI} from "../../../constants";
import Iri from "../../../common/components/Iri";
export const ReferringValue = ({
    property,
    entry
}) => {
    function renderValue(prop, value) {
        if (!value || !prop.multiLine) {
            return value;
        }

        return <div style={{
            whiteSpace: 'pre-line'
        }}>
            {value}
        </div>;
    }

    function extractDisplayValue(value) {
        switch (property.datatype) {
            case DATETIME_URI:
                return formatDateTime(value.value);

            case BOOLEAN_URI:
                return <Switch checked={value.value} readOnly />;

            case MARKDOWN_URI:
                return <ReactMarkdown>{value.value}</ReactMarkdown>;

            default:
                return value.label || renderValue(property, value.value) || <Iri iri={value.id} />;
        }
    }

    const displayValue = property.isGenericIriResource ? decodeURI(entry.id) : extractDisplayValue(entry);

    if (entry.id) {
    // External links should be represented by a direct link to the URI itself
    // Other iri entities should be opened in the metadata editor
        return property.isExternalLink ? <a href={entry.id}>{entry.id}</a> : <LinkedDataLink uri={entry.id}>
            {displayValue}
        </LinkedDataLink>;
    }

    return displayValue;
};
export default ReferringValue;