import axios from 'axios';
import {handleHttpError} from "../common/utils/httpUtils";
import {extractSparqlSelectResults, SPARQL_SELECT_HEADERS} from "./sparqlUtils";


export const lookup = (query, types) => axios.post('/api/v1/rdf/query',
    `
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX fs: <http://fairspace.io/ontology#>
PREFIX text: <http://jena.apache.org/text#>

SELECT ?id ?label
WHERE { 
    ?id text:query ('(label: ${JSON.stringify(query).slice(1, -1)}*) AND (type: "${types.join(' | ')}") AND NOT (dateDeleted: *)' 20);
    rdfs:label ?label
}
`,
    {headers: SPARQL_SELECT_HEADERS})
    .catch(handleHttpError("Error while performing search"))
    .then(extractSparqlSelectResults)
    .then(results => results.map(({id, label}) => ({id, label})));
