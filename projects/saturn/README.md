# Saturn 

## Functionality
Currently Saturn only contains an embedded Fuseki SPARQL server running on :8080/rdf 
and providing the SPARQL 1.1 [protocols for query and update](http://www.w3.org/TR/sparql11-protocol/) as well as the [SPARQL Graph Store protocol](http://www.w3.org/TR/sparql11-http-rdf-update/).
It can be accessed programmatically using one of [RDFConnection](https://jena.apache.org/documentation/rdfconnection/) implementations.
For more information see [Fuseki documentation](https://jena.apache.org/documentation/fuseki2/) 

In the future, Saturn will also host a number of high-level APIs and, at least temporarily, a WebDAV service.

## How to build

`./gradlew clean build`


## Starting the service
The `src` directory contains the actual application.
The `build/distributions` directory contains the distribution archives.
