import axios from 'axios';
import escapeStringRegexp from 'escape-string-regexp';
import {handleHttpError} from "../common/utils/httpUtils";
import {extractSparqlSelectResults, SPARQL_SELECT_HEADERS} from "./sparqlUtils";

const search = (sparql) => axios.post('/api/v1/rdf/query', sparql,
    {headers: SPARQL_SELECT_HEADERS})
    .catch(handleHttpError("Error while performing search"))
    .then(extractSparqlSelectResults);
    // .then(results => results.map(({id, label}) => ({id, label})));

export const lookup = (query, types) => search(`
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX fs: <http://fairspace.io/ontology#>
PREFIX text: <http://jena.apache.org/text#>

SELECT ?id ?label
WHERE { 
    ?id text:query ('(label: ${JSON.stringify(query).slice(1, -1)}*) AND (type: "${types.join(' | ')}") AND NOT (dateDeleted: *)' 20);
    rdfs:label ?label
}
`);

export const searchFiles = (query, parentIri) => {
    const regex = "(^|\\\\s|\\\\.|\\\\-|\\\\,|\\\\;)" + escapeStringRegexp(query);
    return search(`
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX fs: <http://fairspace.io/ontology#>

SELECT ?id ?label ?comment ?type
WHERE { 
    ${parentIri ? ('<' + parentIri + '> fs:contains* ?id .') : ''}
    ?id rdfs:label ?label ;
        a ?type .
    FILTER (?type in (fs:File, fs:Directory, fs:Collection))    
    OPTIONAL { ?id rdfs:comment ?comment }
    FILTER NOT EXISTS { ?id fs:dateDeleted ?anydate }
    FILTER (regex(?label, "${regex}", "i") || regex(?comment, "${regex}", "i"))
}
# LIMIT 10000
`);
};
