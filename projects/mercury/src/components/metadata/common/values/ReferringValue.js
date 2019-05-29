import React from 'react';
import {isDateTimeProperty} from "../../../../utils/linkeddata/metadataUtils";
import DateTime from "../../../common/DateTime";
import LinkedDataLink from "../LinkedDataLink";

function linkLabel(link) {
    return link
        && (link.toString().includes('#')
            ? link.substring(link.lastIndexOf('#') + 1)
            : link.substring(link.lastIndexOf('/') + 1));
}

const ReferringValue = ({property, entry, editorPath}) => {

    function extractDisplayValue(value) {
        let extractedVal = value.label || value.value || linkLabel(value.id) || '';
        extractedVal = isDateTimeProperty(property) ? <DateTime value={extractedVal} absolute /> : extractedVal;
        return extractedVal;
    }

    const displayValue = property.isGenericIriResource ? entry.id : extractDisplayValue(entry);

    if (entry.id) {
        return (
            <LinkedDataLink editorPath={editorPath} uri={entry.id}>
                {displayValue}
            </LinkedDataLink>
        );
    }
    return displayValue;
};

export default ReferringValue;
