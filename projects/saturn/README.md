# Saturn 

## Functionality

### Fuseki 
Saturn runs an embedded Fuseki SPARQL server running on :8080/rdf 
and providing the SPARQL 1.1 [protocols for query and update](http://www.w3.org/TR/sparql11-protocol/) as well as the [SPARQL Graph Store protocol](http://www.w3.org/TR/sparql11-http-rdf-update/).
It can be accessed programmatically using one of [RDFConnection](https://jena.apache.org/documentation/rdfconnection/) implementations.
For more information see [Fuseki documentation](https://jena.apache.org/documentation/fuseki2/) 

### Authentication
The application will verify the authentication by checking the provided JWT token in the `Authorization` header. The 
signature of the token will be validated against the public keys provided by Keycloak. The URL to 
find the keys can be configured by setting the `auth.jwksUrl` configuration property in `application.yaml`.

#### Disabled authentication 
When running the application on localhost, you may want to disabled authentication, so keycloak
is not needed. However, parts of the application contain checks to prevent unauthorized access
(e.g. vocabulary editing is only allowed for users with the datasteward role). For that reason, 
you can specify a list of user-roles for the current user in the `x-fairspace-authorities` HTTP header
sent with the request. See also the `DummyAuthenticator` class for details. 

### High-level metadata

The high-level metadata API runs on :8080/api/v1/metadata/.
Currently they support the following methods:

| HTTP Method | Query Parameters                                  | Request Body              | Effect & response                                                  |
|-------------|---------------------------------------------------|---------------------------|------------------------------------------------------------------- |
| GET         | subject, predicate, object, labels (all optional) | -                         | Returns JsonLD-encoded statements matching the query parameters. The `labels` parameter adds resource labels (rdfs:label) to the response |
| PUT         | -                                                 | JsonLD-encoded statements | Adds statements to the default model                               |
| DELETE      | subject, predicate, object (all optional)         | -                         | Deletes statements matching the query parameters                   |
| DELETE      | -                                                 | JsonLD-encoded statements | Deletes the statements provided                                    |
| PATCH       | -                                                 | JsonLD-encoded statements | Replaces existing triples with the statements provided             |

Additional `:8080/api/v1/metadata/entities/` and `:8080/api/v1/vocabulary/entities/` endpoints allow to retrieve labelled FairSpace entities, optionally filtered by type:


| HTTP Method | Query Parameters                                  | Request Body              | Effect & response                                                      |
|-------------|---------------------------------------------------|---------------------------|----------------------------------------------------------------------- |
| GET         | type (optional, URL-encoded), catalog (boolean, optional)  | -                         | Returns JsonLD-encoded model containing entities and their labels, filtered on type and on `fs:showInCatalog` | 

### Vocabulary API

The vocabulary consists of 3 different parts:
 - a meta vocabulary describing the structure of the user and system vocabularies
 - a system vocabulary describing the structure of fixed metadata classes (e.g File, Collection etc.)
 - a user vocabulary describing the structure of all other metadata classes. This vocabulary can be updated by data stewards

The system and user vocabulary are exposed as a single vocabulary. However, the system vocabulary triples can not be updated by the user.
 
The APIs run on :8080/api/v1/vocabulary/ and :8080/api/v1/meta-vocabulary/. The data for those vocabularies
are stored in separate graphs internally. 

Currently they support the following methods:

| HTTP Method | Query Parameters                                  | Request Body              | Effect & response                                                  |
|-------------|---------------------------------------------------|---------------------------|------------------------------------------------------------------- |
| GET         | subject, predicate, object, labels (all optional) | -                         | Returns JsonLD-encoded statements matching the query parameters. The `labels` parameter adds resource labels (rdfs:label) to the response |
| PUT         | -                                                 | JsonLD-encoded statements | Adds statements to the default model                               |
| DELETE      | subject, predicate, object (all optional)         | -                         | Deletes statements matching the query parameters                   |
| DELETE      | -                                                 | JsonLD-encoded statements | Deletes the statements provided                                    |
| PATCH       | -                                                 | JsonLD-encoded statements | Replaces existing triples with the statements provided             |

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
 - access
 - canRead
 - canWrite
 - canManage
 - createdBy
 - dateCreated
 - modifiedBy
 - dateModified
 
 ### High-level permissions API
 
 The high-level permissions API runs on :8080/api/v1/permissions/.
 
| HTTP Method | Query Parameters                          | Request Body              | Effect & response                                                                                                                                        |
|-------------|-------------------------------------------|---------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------- |
| GET         | iri (URL-encoded)                         | -                         | Returns current user's permissions as {"access": <one of "None", "Read", "Write", "Manage">, "canRead": <true or false>, "canWrite": <true or false>, "canManage": <true or false>}                                                              |
| GET         | iri (URL-encoded), all                    | -                         | Returns a JSON array of all users' permissions for a specific resource [{"user": <user IRI>, "access": <one of "None", "Read", "Write", "Manage">, "canRead": <true or false>, "canWrite": <true or false>, "canManage": <true or false>}, ...] |
| PUT         | iri (URL-encoded)                         | {"user": <user IRI>, "access": <one of "None", "Read", "Write", "Manage">}    | Sets user's permissions for a specific resource                                                      |


 The API for marking entities as write-restricted runs on :8080/api/v1/permissions/restricted/.

| HTTP Method | Query Parameters                          | Request Body                    | Effect & response                                                                 |
|-------------|-------------------------------------------|---------------------------------|---------------------------------------------------------------------------------- |
| GET         | iri (URL-encoded)                         | -                               | Answers whether an entity is marked as write-restricted: {"restricted": <true or false>} |
| PUT         | iri (URL-encoded)                         | {"restricted": <true or false>} | Marks an entity as (not) write-restricted                                         |


 ### File storage API
 
 A file storage API is exposed via the WebDAV protocol. It runs on `:8080/webdav/v1/`. All visible collections in the system are exposed as top-level directories.
 Creating a top-level directory via WebDAV will result in an error message.

## How to build

`./gradlew clean build`


## Starting the service
The `src` directory contains the actual application.
The `build/distributions` directory contains the distribution archives.
Use [application.yaml](application.yaml) to make adjustments to the application's configuration.
