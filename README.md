# Neptune
Service for working with triples. Currently leveraging Apache Jena and SQL.

## Starting the service
The `src` directory contains the actual application. It can be run from the IDE or from the command line
using gradle: `gradle bootRun`.


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
                "datatype": "http://www.w3.org/2001/vcard-rdf/3.0#FN"
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
                "datatype": "http://www.w3.org/2001/vcard-rdf/3.0#FN"
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
