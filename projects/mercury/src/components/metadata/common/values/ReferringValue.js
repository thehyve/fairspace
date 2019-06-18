import React from 'react';
import Switch from "@material-ui/core/Switch";
import DateTime from "../../../common/DateTime";
import LinkedDataLink from "../LinkedDataLink";
import {BOOLEAN_URI, DATETIME_URI} from "../../../../constants";

function linkLabel(link) {
    return link
        && (link.toString().includes('#')
            ? link.substring(link.lastIndexOf('#') + 1)
            : link.substring(link.lastIndexOf('/') + 1));
}

const ReferringValue = ({property, entry, editorPath}) => {
    function extractDisplayValue(value) {
        switch (property.datatype) {
            case DATETIME_URI:
                return <DateTime value={value.value} absolute />;
            case BOOLEAN_URI:
                return <Switch checked={value.value} readOnly />;
            default:
                return value.label || value.value || linkLabel(value.id) || '';
        }
    }

    const displayValue = property.isGenericIriResource ? entry.id : extractDisplayValue(entry);

    if (entry.id) {
        // External links should be represented by a direct link to the URI itself
        // Other iri entities should be opened in the metadata/vocabulary editor
        return property.isExternalLink
            ? <a href={entry.id}>{displayValue}</a>
            : (
                <LinkedDataLink editorPath={editorPath} uri={entry.id}>
                    {displayValue}
                </LinkedDataLink>
            );
    }

    return displayValue;
};

export default ReferringValue;
