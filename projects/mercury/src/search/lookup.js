import axios from 'axios';
import escapeStringRegexp from 'escape-string-regexp';
import {handleHttpError} from "../common/utils/httpUtils";
import {extractSparqlSelectResults, SPARQL_SELECT_HEADERS} from "./sparqlUtils";

const search = (sparql) => axios.post('/api/v1/rdf/query', sparql,
    {headers: SPARQL_SELECT_HEADERS})
    .catch(handleHttpError("Error while performing search"))
    .then(extractSparqlSelectResults);

const regex = query => ("(^|\\s|\\.|\\-|\\,|\\;|\\(|\\[|\\{|\\?|\\!|\\\\|\\/)" + escapeStringRegexp(query))
    .replace(/\\/g, "\\\\");

export const lookup = (query, type) => search(`
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX fs: <http://fairspace.io/ontology#>

SELECT ?id ?label ?comment
WHERE { 
    ?id a <${type}> ;
        rdfs:label ?label .
    OPTIONAL { ?id rdfs:comment ?comment }
    FILTER NOT EXISTS { ?id fs:dateDeleted ?anydate }
    FILTER (regex(?label, "${regex(query)}", "i") || regex(?comment, "${regex(query)}", "i"))
}
LIMIT 20
`);

export const searchFiles = (query, parentIri) => search(`
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX fs: <http://fairspace.io/ontology#>

SELECT ?id ?label ?comment ?type
WHERE { 
    ${parentIri ? ('?id fs:ownedBy* <' + parentIri + '> .') : ''}
    ?id rdfs:label ?label ;
        a ?type .
    FILTER (?type in (fs:File, fs:Directory, fs:Collection))    
    OPTIONAL { ?id rdfs:comment ?comment }
    FILTER NOT EXISTS { ?id fs:dateDeleted ?anydate }
    FILTER (regex(?label, "${regex(query)}", "i") || regex(?comment, "${regex(query)}", "i"))
}
LIMIT 10000
`);
