# Ceres - RDF and SPARQL over HTTP

## How to build

`./gradlew clean build`


## Starting the service
The `src` directory contains the actual application. It can be run from the IDE or from the command line
using gradle: `gradle bootRun`.

## Configuration

Configuration is done using Spring Boot, so you can use any of the methods from [Spring boot externalized configuration](https://docs.spring.io/spring-boot/docs/current/reference/html/boot-features-external-config.html)
to alter the configuration. For available properties, see `resources/application.yaml`


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
