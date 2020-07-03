import {extractJsonData} from "../common/utils/httpUtils";

export const SPARQL_SELECT_HEADERS = {'Content-Type': 'application/sparql-query', 'Accept': 'application/json'};

export const extractSparqlSelectResults = response => extractJsonData(response)
    .results
    .bindings
    .map(row => Object.fromEntries(Object.entries(row).map(([k, v]) => [k, v.value])));
