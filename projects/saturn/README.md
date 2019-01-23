# Saturn 

## Functionality

### Fuseki 
Saturn runs an embedded Fuseki SPARQL server running on :8080/rdf 
and providing the SPARQL 1.1 [protocols for query and update](http://www.w3.org/TR/sparql11-protocol/) as well as the [SPARQL Graph Store protocol](http://www.w3.org/TR/sparql11-http-rdf-update/).
It can be accessed programmatically using one of [RDFConnection](https://jena.apache.org/documentation/rdfconnection/) implementations.
For more information see [Fuseki documentation](https://jena.apache.org/documentation/fuseki2/) 

### High-level metadata API

The high-level metadata API runs on :8080/statements.
Currently it supports the following methods:

| HTTP Method | Query Parameters                          | Request Body              | Effect & response                                                  |
|-------------|-------------------------------------------|---------------------------|------------------------------------------------------------------- |
| GET         | subject, predicate, object (all optional) | -                         | Returns JsonLD-encoded statements matching the query parameters    |
| PUT         | -                                         | JsonLD-encoded statements | Adds statements to the default model                               |
| DELETE      | subject, predicate, object (all optional) | -                         | Deletes statements matching the query parameters                   |
| DELETE      | -                                         | JsonLD-encoded statements | Deletes the statements provided                                    |
| PATCH       | -                                         | JsonLD-encoded statements | Replaces existing triples with the statements provided             |

In the future, Saturn will also host a number of high-level APIs and, at least temporarily, a WebDAV service.

## How to build

`./gradlew clean build`


## Starting the service
The `src` directory contains the actual application.
The `build/distributions` directory contains the distribution archives.
