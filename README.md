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

## API

| Command | Description |
| --- | --- |
| GET /metadata?uri=|Retrieve the metadata assosciated with the corresponding uri |
| POST /metadata| Store triples |
| DELETE /metadata| Delete triples |
| POST /metadata/predicate| Store a predicate with it's label |
| DELETE /metadata/predicate| Delete a predicate with it's label |
| POST /metadata/predicates| Store a list of  predicates with their label |
| DELETE /metadata/predicates| Delete a list of predicate with their label |

### JSON format
#### Triple
```
{
    "subject": "http:///file1",
    "predicate": "http://schema.org/Author",
            "object": {
                "type": "literal",
                "value": "Hans",
                "lang": "en",
                "dataType": "http://www.w3.org/2001/vcard-rdf/3.0#FN"
            }
}
```
#### Predicate
 ```
{
	"uri": "http://schema.org/Author",
	"label": "creator"
}
```
#### Response GET /metadata
```
{
    "triples": [
        {
            "subject": "http://file1",
            "predicate": "http://schema.org/Author",
            "object": {
                "type": "literal",
                "value": "Hans",
                "lang": "en",
                "dataType": "http://www.w3.org/2001/vcard-rdf/3.0#FN"
            }
        },
        {
            "subject": "http://file1",
            "predicate": "http://schema.org/creator",
            "object": {
                "type": "bnode",
                "value": "_:7c9f11751f117771ad79000c2f3fbc19"
            }
        }
    ],
    "predicateInfo": [
        {
            "label": "Author",
            "uri": "http://schema.org/Author"
        }
    ]
}
```
