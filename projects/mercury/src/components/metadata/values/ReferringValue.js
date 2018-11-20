import React from 'react'
import {navigableLink} from "../../../utils/metadatautils";
import DateTime from "../../generic/DateTime/DateTime";
import {isDateTimeProperty} from '../../../utils/metadatautils';
import {RESOURCE_URI} from "../../../services/MetadataAPI/MetadataAPI";

const ReferringValue = ({property, entry}) => {
    function extractDisplayValue(value) {
        let extractedVal = value.label || value.value || linkLabel(value.id) || '';
        extractedVal = isDateTimeProperty(property) ? DateTime({value: extractedVal}) : extractedVal;
        return extractedVal;
    }

    function linkLabel(link) {
        return link &&
            (link.toString().includes('#')
                ? link.substring(link.lastIndexOf('#') + 1)
                : link.substring(link.lastIndexOf('/') + 1))
    }

    const displayValue = (property.range === RESOURCE_URI) ? entry.id : extractDisplayValue(entry);

    if (entry.id) {
        return (<a href={navigableLink(entry.id)}>{displayValue}</a>)
    } else {
        return displayValue;
    }
}

export default ReferringValue;
