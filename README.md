# Neptune
Service for working with triples. Currently leveraging Ceres and SQL.

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

**Reminder** this service also needs Ceres, which is not included in this setup.

## Starting with Kubernetes

See [charts readme](/charts/neptune/README.md)

## Developers

If you want to develop on Neptune, it is recommended to activate the dev Spring profile. This is also needed for Gradle as
it uses a different database (h2) in development mode. To do so set SPRING_PROFILE=dev in your environment variables.
If you do not want to use development mode you will need to install a postgresql database locally, or run it as a Docker 
container.

## API

| Command | Description |
| --- | --- |
| GET /metadata?uri=|Retrieve the metadata associated with the corresponding uri |
| POST /metadata| Store triples |
| DELETE /metadata| Delete triples |
| POST /metadata/predicate| Store a predicate with it's label |
| DELETE /metadata/predicate| Delete a predicate with it's label |
| POST /metadata/predicates| Store a list of  predicates with their label |
| DELETE /metadata/predicates| Delete a list of predicate with their label |
| GET /collections | Get collections' metadata |
| POST /collections | Store metadata for a collection |
| PATCH /collections | Change name or description of collections' metadata |


### JSON format

#### Response GET /metadata
```
GET /metadaata?uri=http://store.example.com HTTP/1.1
Host: localhost:8080
Content-Type: application/ld+json

{
    "@id": "http://store.example.com/",
    "@type": "Store",
    "name": "Links Bike Shop",
    "description": "The most \"linked\" bike store on earth!",
    "product": [
        {
            "@id": "p:links-swift-chain",
            "@type": "Product",
            "name": "Links Swift Chain",
            "description": "A fine chain with many links.",
            "category": ["cat:parts", "cat:chains"],
            "price": "10.00",
            "stock": 10
        },
        {
            "@id": "p:links-speedy-lube",
            "@type": "Product",
            "name": "Links Speedy Lube",
            "description": "Lubricant for your chain links.",
            "category": ["cat:lube", "cat:chains"],
            "price": "5.00",
            "stock": 20
        }
    ],
    "@context": {
        "Store": "http://ns.example.com/store#Store",
        "Product": "http://ns.example.com/store#Product",
        "product": "http://ns.example.com/store#product",
        "category":
        {
          "@id": "http://ns.example.com/store#category",
          "@type": "@id"
        },
        "price": "http://ns.example.com/store#price",
        "stock": "http://ns.example.com/store#stock",
        "name": "http://purl.org/dc/terms/title",
        "description": "http://purl.org/dc/terms/description",
        "p": "http://store.example.com/products/",
        "cat": "http://store.example.com/category/"
    }
}
```

#### Store collection metadata

```
POST /collections HTTP/1.1
Host: localhost:8080
Content-Type: application/json

{
  "uri": "http://example.com/coll1",
  "name": "Collection 1",
  "description": "My first collection""
}
```

#### Retrieve collection metadata

```
GET /collections HTTP/1.1
Host: localhost:8080
Accept: application/json

```

#### Response from GET /collections

```json
[
    {
        "uri": "http://example.com/coll1",
        "name": "Collection 1",
        "description": "My first collection"
    },
    {
        "uri": "http://example.com/coll2",
        "name": "Collection 2",
        "description": "My second collection"
    }    
]

```
