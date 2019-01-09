import React from 'react';
import {navigableLink, isDateTimeProperty} from "../../../utils/metadatautils";
import DateTime from "../../common/DateTime";
import {RESOURCE_URI} from "../../../services/MetadataAPI/MetadataAPI";

function linkLabel(link) {
    return link
        && (link.toString().includes('#')
            ? link.substring(link.lastIndexOf('#') + 1)
            : link.substring(link.lastIndexOf('/') + 1));
}

const ReferringValue = ({property, entry}) => {
    function extractDisplayValue(value) {
        let extractedVal = value.label || value.value || linkLabel(value.id) || '';
        extractedVal = isDateTimeProperty(property) ? <DateTime value={extractedVal} absolute /> : extractedVal;
        return extractedVal;
    }

    const displayValue = (property.range === RESOURCE_URI) ? entry.id : extractDisplayValue(entry);

    if (entry.id) {
        return (
            <a href={navigableLink(entry.id)}>
                {displayValue}
            </a>
        );
    }
    return displayValue;
};

export default ReferringValue;
