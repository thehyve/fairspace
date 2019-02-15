# Saturn 

## Functionality

### Fuseki 
Saturn runs an embedded Fuseki SPARQL server running on :8080/rdf 
and providing the SPARQL 1.1 [protocols for query and update](http://www.w3.org/TR/sparql11-protocol/) as well as the [SPARQL Graph Store protocol](http://www.w3.org/TR/sparql11-http-rdf-update/).
It can be accessed programmatically using one of [RDFConnection](https://jena.apache.org/documentation/rdfconnection/) implementations.
For more information see [Fuseki documentation](https://jena.apache.org/documentation/fuseki2/) 

### High-level metadata API

The high-level metadata API runs on :8080/api/meta/.
Currently it supports the following methods:

| HTTP Method | Query Parameters                                  | Request Body              | Effect & response                                                  |
|-------------|---------------------------------------------------|---------------------------|------------------------------------------------------------------- |
| GET         | subject, predicate, object, labels (all optional) | -                         | Returns JsonLD-encoded statements matching the query parameters. The `labels` parameter adds resource labels (rdfs:label) to the response |
| PUT         | -                                                 | JsonLD-encoded statements | Adds statements to the default model                               |
| DELETE      | subject, predicate, object (all optional)         | -                         | Deletes statements matching the query parameters                   |
| DELETE      | -                                                 | JsonLD-encoded statements | Deletes the statements provided                                    |
| PATCH       | -                                                 | JsonLD-encoded statements | Replaces existing triples with the statements provided             |

An additional `:8080/api/meta/entities/` endpoint allows to retrieve labelled FairSpace entities, optionally filtered by type:


| HTTP Method | Query Parameters                                  | Request Body              | Effect & response                                                      |
|-------------|---------------------------------------------------|---------------------------|----------------------------------------------------------------------- |
| GET         | type (optional, URL-encoded)                      | -                         | Returns JsonLD-encoded modetaining FairSpace entities and their labels |


### High-level vocabulary API
The high-level metadata API runs on :8080/api/vocabulary/.
Currently it supports the following methods:

| HTTP Method | Query Parameters                          | Request Body              | Effect & response                                                  |
|-------------|-------------------------------------------|---------------------------|------------------------------------------------------------------- |
| GET         | -                                         | -                         | Returns JsonLD-encoded vocabulary                                  |
| PUT         | -                                         | JsonLD-encoded vocabulary | Replaces the vocabulary with the provided model                    |

### High-level collections API
The high-level metadata API runs on :8080/api/collections/.
Currently it supports the following methods:

| HTTP Method | Query Parameters                          | Request Body              | Effect & response                                                  |
|-------------|-------------------------------------------|---------------------------|------------------------------------------------------------------- |
| GET         | -                                         | -                         | Returns a JSON-encoded array of all visible collections            |
| GET         | iri (URL-encoded)                         | -                         | Returns a JSON-encoded collection                                  |
| PUT         | -                                         | JSON-encoded collection   | Creates and returns new collection                                 |
| PATCH       | -                                         | JSON-encoded collection   | Modifies an existing collection and returns the modified version   |
| DELETE      | iri (URL-encoded)                         | -                         | Deletes a collection             v                                 |

Currently a collection has the following fields, all represented as strings:
 - iri
 - name
 - description 
 - location
 - type 
 - creator
 - dateCreated
 - dateModified

## How to build

`./gradlew clean build`


## Starting the service
The `src` directory contains the actual application.
The `build/distributions` directory contains the distribution archives.
Use [application.yaml](application.yaml) to make adjustments to the application's configuration.
