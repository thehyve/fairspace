# Ceres - RDF and SPARQL over HTTP

## How to build

`./gradlew clean build`


## How to run

```
# copy ceres-*.zip from <Ceres project directory>/build/distributions/
unzip ceres-*.zip
cd ceres-*/bin/
./ceres
```

## Configuration

To run with custom configuration
```
./ceres -config myconfig.conf
```

Default configuration file:

```yaml
ktor {
  deployment {
    port = 8080
  }

  application {
    modules = [io.fairspace.ceres.ModuleKt.ceresModule]
  }
}
jena {
  dataset {
    path = data
  }
}
authentication {
  jwt {
    enabled = false
    issuer = "http://localhost:9080"
    realm = fairspace
    audience = fairspace
  }
}
```

Alternatively, you can use environment variables, e.g. `CERES_AUTH_ENABLED`, to alter configuration settings

See also: [Ktor configuration](https://ktor.io/servers/configuration.html#available-config)


## How to use

### To add statements

```
POST /model/mymodel/statements HTTP/1.1
Host: localhost:8080
Cache-Control: no-cache
Content-Type: application/ld+json

{ 
  "http://somewhere/BillKidd" : { 
    "http://www.w3.org/2001/vcard-rdf/3.0#FN" : [ { 
      "type" : "literal" ,
      "value" : "Bill Kidd"
    }
     ] ,
    "http://www.w3.org/2001/vcard-rdf/3.0#N" : [ { 
      "type" : "bnode" ,
      "value" : "_:b764ccf5-ca28-4d3e-890c-46de043af0bb"
    }
     ]
  }
   ,
  "_:b764ccf5-ca28-4d3e-890c-46de043af0bb" : { 
    "http://www.w3.org/2001/vcard-rdf/3.0#Given" : [ { 
      "type" : "literal" ,
      "value" : "Bill"
    }
     ] ,
    "http://www.w3.org/2001/vcard-rdf/3.0#Family" : [ { 
      "type" : "literal" ,
      "value" : "Kidd"
    }
     ]
  }
}
```

### To retrieve all statements in a model

```
GET /model/mymodel/statements HTTP/1.1
Host: localhost:8080
Cache-Control: no-cache
Accept: application/ld+json
```

### To retrieve all statements for a specific subject (add `&predicate=...` to filter by predicate as well)

```
GET /model/mymodel/statements?subject=http://somewhere/BillKidd HTTP/1.1
Host: localhost:8080
Cache-Control: no-cache
Accept: application/ld+json
```


### To delete all statements for a specific subject (add `&predicate=...` to filter by predicate as well)

```
DELETE /model/mymodel/statements?subject=http://somewhere/BillKidd HTTP/1.1
Host: localhost:8080
Cache-Control: no-cache
Content-Type: application/ld+json
```

### To update a model (removes all existing triples with provided subjects and predicates then adds new statements)


```
PATCH /model/mymodel/statements HTTP/1.1
Host: localhost:8080
Cache-Control: no-cache
Content-Type: application/rdf+json

{ 
  "http://somewhere/BillKidd" : { 
    "http://www.w3.org/2001/vcard-rdf/3.0#FN" : [ { 
      "type" : "literal" ,
      "value" : "William Shakespeare"
    }
     ] 
  }
}
```
