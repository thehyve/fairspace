# Neptune
Service for working with collections. The list of collections is stored in a postgres database.
The name and description of the collection is stored in Ceres, whereas the actual contents of the
collection are being stored in Titan

## Starting the service
The `src` directory contains the actual application. It can be run from the IDE or from the command line
using gradle: `gradle bootRun`.

## Starting with Docker
This image can use an postgresql image to use as it's SQL database. To use this functionality, enter the following commands:

Create a postgres image

`docker run -d --name demo-postgres -e  POSTGRES_PASSWORD=test123 -e POSTGRES_USER=dbuser -e POSTGRES_DB=demo -it postgres`

Build the .jar file and create image

`gradle clean build test`

`docker build . --tag neptune`

Link the images together

`docker run -d  --name neptune-service-dev  --link demo-postgres:postgres -p 8080:8080 -e SPRING_DATASOURCE_USERNAME=dbuser -e SPRING_DATASOURCE_PASSWORD=test123 -e SPRING_DATASOURCE_URL=jdbc:postgresql://demo-postgres:5432/demo neptune`

**Reminder** this service also needs Ceres and Titan, which is not included in this setup.

## Starting with Kubernetes

See [charts readme](/charts/neptune/README.md)

## Developers

If you want to develop on Neptune, it is recommended to activate the dev Spring profile. This is also needed for Gradle as
it uses a different database (h2) in development mode. To do so set SPRING_PROFILE=dev in your environment variables.
If you do not want to use development mode you will need to install a postgresql database locally, or run it as a Docker 
container.

## API

Neptune authenticates Oauth2 and uses permission mechanism to authorize user's actions.
Every collection has an associated list of user permissions. Currently supported access levels are:
- Manage
- Write
- Read
- None (default)


A creator of a collection automatically gets `Manage` permissions. 

| Command | Description |
| --- | --- |
| GET / | Get list of collections with at least `Read` access  |
| POST / | Store a new collection |
| GET /<id> | Get collection |
| PATCH /<id> | Change name or description of collections' metadata |
| DELETE /<id> | Delete a single collection |
| GET /<id>/authorizations | Get a list of permissions for a specific collection |
| GET /<id>/authorization | Get current user's permission for a specific collection |
| GET /authorizations?user=<user> | Get a permission for a specific user |
| PUT /authorizations | Adds or modifies a permission |


### JSON format

#### Store collection metadata

```
POST / HTTP/1.1
Host: localhost:8080
Content-Type: application/json
Authorization: Bearer <JWT> 

{
  "metadata": 
    {
      "name": "Collection 1",
      "description": "My first collection""
    }
}
```

#### Retrieve collection metadata


```
GET / HTTP/1.1
Host: localhost:8080
Accept: application/json
Authorization: Bearer <JWT> 


```

```json
[
    {
        "id": 1,
        "type": "LOCAL_FILE",
        "typeIdentifier": "1",
        "metadata": {
            "uri": "http://fairspace.com/iri/collections/1",
            "name": "Collection 1",
            "description": "My first collection"
        }
    },
    {
        "id": 2,
        "type": "LOCAL_FILE",
        "typeIdentifier": "2",
        "metadata": {
            "uri": "http://fairspace.com/iri/collections/2",
            "name": "Collection 2",
            "description": "My first collection"
        }
    }
]

```

#### Update collection metadata

```
PATCH /1 HTTP/1.1
Host: localhost:8080
Content-Type: application/json
Authorization: Bearer <JWT> 


{
  "metadata": 
    {
      "name": "Collection 1",
      "description": "My first collection""
    }
}
```

#### Get authorizations for a collection.

```
GET /123/authorizations?user=user@example.com HTTP/1.1
Host: localhost:8080
Content-Type: application/json
Authorization: Bearer <JWT> 


[
    {
      "user": "user@example.com",
      "collectionId": 123,
      "permission": "Write"
    },
    {
      "user": "user2@example.com",
      "collectionId": 123,
      "permission": "Read"
    }
]
```

#### Get user's authorization. Returns `"permission": "None"` if no permission was assigned.

```
GET /123/authorization HTTP/1.1
Host: localhost:8080
Content-Type: application/json
Authorization: Bearer <JWT> 


{
  "user": "user@example.com",
  "collectionId": 123,
  "permission": "Write"
}
```

#### Set user's authorization

```
PUT /authorization HTTP/1.1
Host: localhost:8080
Content-Type: application/json
Authorization: Bearer <JWT> 


{
  "user": "user@example.com",
  "collectionId": 123,
  "permission": "Write"
}
```
