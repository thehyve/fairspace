import {LABEL_URI} from "../services/MetadataAPI/MetadataAPI";

/**
 * Returns the label for the given entity.
 *
 * If an rdfs:label is present, that label is used. Otherwise
 * the last part of the id is returned
 *
 * @param entity    Expanded JSON-LD entity
 * @returns string
 */
export function getLabel(entity) {
    if(
        Array.isArray(entity[LABEL_URI]) &&
        entity[LABEL_URI].length > 0 &&
        entity[LABEL_URI][0]['@value']
    ) {
        return entity[LABEL_URI][0]['@value'];
    } else {
        let id = entity['@id'];
        return id &&
            (id.includes('#')
                ? id.substring(id.lastIndexOf('#') + 1)
                : id.substring(id.lastIndexOf('/') + 1))
    }
}

/**
 * Returns a navigable link for a given metadata url
 *
 * If the url refers to an entity within our workspace, a special
 * url is constructed to show the page in the frontend.
 * Otherwise, the url is just returned as is
 *
 * @param link          The uri to make navigable
 * @returns string      The navigable URI
 */
export function navigableLink(link) {
    return link.startsWith(window.location.origin)
        ? link
            .replace('/iri/collections/', '/collections/')
            .replace('/iri/', '/metadata/')
        : link
}


export function isDateTimeProperty(property) {
    return  property.range === 'http://www.w3.org/TR/xmlschema11-2/#dateTime';
}

export function genUuid() {
    return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g,
        // eslint-disable-next-line
        c => (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16))
}

export function getValues(entity, property) {
    return (entity[property] || []).map(v => v['@value'] || v['@id'])
}

export function getSingleValue(entity, property) {
    let values = getValues(entity, property);
    return (values.length > 0) ? values[0] : undefined
}
