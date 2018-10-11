import React from 'react'
import {navigableLink} from "../../../utils/metadatautils";
import DateTime from "../../generic/DateTime/DateTime";
import {isDateCreatedProperty} from '../../../utils/metadatautils';

const ReferringValue = ({property, entry}) => {
    function extractDisplayValue(value) {
        let extractedVal = value.label || value.value || linkLabel(value.id) || '';
        extractedVal = isDateCreatedProperty(property) ? DateTime(extractedVal) : extractedVal;
        return extractedVal;
    }

    function linkLabel(link) {
        return link &&
            (link.toString().includes('#')
                ? link.substring(link.lastIndexOf('#') + 1)
                : link.substring(link.lastIndexOf('/') + 1))
    }

    const displayValue = extractDisplayValue(entry);

    if (entry.id) {
        return (<a href={navigableLink(entry.id)}>{displayValue}</a>)
    } else {
        return displayValue;
    }
}

export default ReferringValue;
