import React from 'react'

const ReferringValue = ({property, entry}) => {
    function navigableLink(link) {
        return link.startsWith(window.location.origin)
            ? link.replace('/iri/collections/', '/collections/').replace('/iri/', '/metadata/')
            : link
    }

    function extractDisplayValue(value) {
        return value.label || value.value || linkLabel(value.id) || '';
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
