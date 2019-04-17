import React from 'react';
import {isDateTimeProperty} from "../../../utils/metadataUtils";
import DateTime from "../../common/DateTime";
import {RESOURCE_URI} from "../../../constants";
import LinkedDataLink from "../common/LinkedDataLink";

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

    const displayValue = (property.className === RESOURCE_URI) ? entry.id : extractDisplayValue(entry);

    if (entry.id) {
        return (
            <LinkedDataLink uri={entry.id}>
                {displayValue}
            </LinkedDataLink>
        );
    }
    return displayValue;
};

export default ReferringValue;
