import axios from 'axios';
import escapeStringRegexp from 'escape-string-regexp';
import {handleHttpError} from "../common/utils/httpUtils";
import {extractSparqlSelectResults, SPARQL_SELECT_HEADERS} from "./sparqlUtils";
import {FAIRSPACE_NS, RDFS_NS} from "../constants";

const search = (sparql) => axios.post('/api/rdf/query', sparql,
    {headers: SPARQL_SELECT_HEADERS})
    .catch(handleHttpError("Error while performing search"))
    .then(extractSparqlSelectResults);

const regex = query => ("(^|\\s|\\.|\\-|\\,|\\;|\\(|\\[|\\{|\\?|\\!|\\\\|\\/|_)" + escapeStringRegexp(query))
    .replace(/\\/g, "\\\\");

export const lookup = (query, type) => search(`
PREFIX rdfs: <${RDFS_NS}>
PREFIX fs: <${FAIRSPACE_NS}>

SELECT ?id ?label ?comment
WHERE {
    BIND(${JSON.stringify(query)} AS ?label)    
    ?id rdfs:label ?label; a <${type}> .
    OPTIONAL { ?id rdfs:comment ?comment }
    FILTER NOT EXISTS { ?id fs:dateDeleted ?anydate }
}
`).then(results => (results.length ? results : search(`
PREFIX rdfs: <${RDFS_NS}>
PREFIX fs: <${FAIRSPACE_NS}>

SELECT ?id ?label ?comment
WHERE {
    ?id a <${type}> ;
        rdfs:label ?label .
    OPTIONAL { ?id rdfs:comment ?comment }
    FILTER NOT EXISTS { ?id fs:dateDeleted ?anydate }
    FILTER (regex(?label, "${regex(query)}", "i") || regex(?comment, "${regex(query)}", "i"))
}
LIMIT 20
`)));

export const searchFiles = (query, parentIri) => search(`
PREFIX rdfs: <${RDFS_NS}>
PREFIX fs: <${FAIRSPACE_NS}>

SELECT ?id ?label ?comment ?type
WHERE { 
    ${parentIri ? ('?id fs:belongsTo* <' + parentIri + '> .') : ''}
    ?id rdfs:label ?label ;
        a ?type .
    FILTER (?type in (fs:File, fs:Directory, fs:Collection))    
    OPTIONAL { ?id rdfs:comment ?comment }
    FILTER NOT EXISTS { ?id fs:dateDeleted ?anydate }
    FILTER (regex(?label, "${regex(query)}", "i") || regex(?comment, "${regex(query)}", "i"))
}
LIMIT 10000
`);
