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
POST /statements HTTP/1.1
Host: localhost:8080
Cache-Control: no-cache
Content-Type: application/ld+json

{
  "@context": "http://schema.org",
  "@type": "Book",
  "name": "Semantic Web Primer (First Edition)",
  "publisher": "Linked Data Tools",
  "inLanguage": "English",
  "bookFormat":
  {
     "@type": "EBook"
  },
  "offers":
  {
     "@type": "Offer",
     "price": "2.95",
     "priceCurrency": "USD",
  },
}
```

### To retrieve all statements in a model

```
GET /statements HTTP/1.1
Host: localhost:8080
Cache-Control: no-cache
Accept: application/ld+json
```

### To retrieve all statements for a specific subject (add `&predicate=...` to filter by predicate as well)

```
GET /statements?subject=http://somewhere/BillKidd HTTP/1.1
Host: localhost:8080
Cache-Control: no-cache
Accept: application/ld+json
```


### To delete all statements for a specific subject (add `&predicate=...` to filter by predicate as well)

```
DELETE /statements?subject=http://somewhere/BillKidd HTTP/1.1
Host: localhost:8080
Cache-Control: no-cache
Content-Type: application/ld+json
```

### To update a model (removes all existing triples with provided subjects and predicates then adds new statements)


```
PATCH /statements HTTP/1.1
Host: localhost:8080
Cache-Control: no-cache
Content-Type: application/ld+json

{
  "@context": "http://schema.org",
  "@type": "Book",
  "name": "Semantic Web Primer (First Edition)",
  "publisher": "Linked Data Tools",
  "inLanguage": "English",
  "bookFormat":
  {
     "@type": "EBook"
  },
  "offers":
  {
     "@type": "Offer",
     "price": "2.95",
     "priceCurrency": "USD",
  },
}
```
